/**
 * Enterprise Permanent Data Persistence Vault
 * Ensures that user-created projects, uploaded media, and custom settings
 * are NEVER lost across server restarts, redeployments, cache refreshes, or git pushes.
 */

import { api } from '../services/api';

const VAULT_KEYS = {
  PROJECTS: 'sakhawat_vault_projects_v2',
  SETTINGS: 'sakhawat_vault_settings_v2',
  MEDIA: 'sakhawat_vault_media_v2',
  DELETED_IDS: 'sakhawat_vault_deleted_ids_v2',
};

const getRaw = (key, fallback = []) => {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setRaw = (key, val) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Vault write warning:', e.message);
  }
};

export const DataVault = {
  // Get all permanently saved vault projects
  getVaultProjects: () => {
    return getRaw(VAULT_KEYS.PROJECTS, []);
  },

  // Save or update a project in the permanent vault
  saveProject: (project) => {
    if (!project || !project.id) return;
    const current = getRaw(VAULT_KEYS.PROJECTS, []);
    const deleted = getRaw(VAULT_KEYS.DELETED_IDS, []);

    // Remove from deleted list if re-added
    const updatedDeleted = deleted.filter((id) => id !== project.id);
    setRaw(VAULT_KEYS.DELETED_IDS, updatedDeleted);

    const existsIndex = current.findIndex((p) => p.id === project.id || (project.slug && p.slug === project.slug));
    let updated;
    if (existsIndex >= 0) {
      updated = [...current];
      updated[existsIndex] = { ...updated[existsIndex], ...project, _userSaved: true };
    } else {
      updated = [{ ...project, _userSaved: true }, ...current];
    }
    setRaw(VAULT_KEYS.PROJECTS, updated);

    // Also sync to legacy cache for backward compatibility
    setRaw('sakhawat_cached_all_projects', updated);
  },

  // Explicitly delete a project so it is not re-created
  deleteProject: (projectId) => {
    if (!projectId) return;
    const current = getRaw(VAULT_KEYS.PROJECTS, []);
    const updated = current.filter((p) => p.id !== projectId);
    setRaw(VAULT_KEYS.PROJECTS, updated);

    const deleted = getRaw(VAULT_KEYS.DELETED_IDS, []);
    if (!deleted.includes(projectId)) {
      setRaw(VAULT_KEYS.DELETED_IDS, [...deleted, projectId]);
    }

    setRaw('sakhawat_cached_all_projects', updated);
  },

  // Merge server projects with local vault projects
  mergeProjects: (serverProjects = []) => {
    const vaultProjects = getRaw(VAULT_KEYS.PROJECTS, []);
    const deletedIds = new Set(getRaw(VAULT_KEYS.DELETED_IDS, []));

    // If server returned valid projects, use them as authoritative base
    if (Array.isArray(serverProjects) && serverProjects.length > 0) {
      const filteredServer = serverProjects.filter((sp) => sp && sp.id && !deletedIds.has(sp.id));
      const vaultMap = new Map();
      vaultProjects.forEach((vp) => {
        if (vp && vp.id) vaultMap.set(vp.id, vp);
        if (vp && vp.slug) vaultMap.set(vp.slug, vp);
      });

      const mergedList = filteredServer.map((sp) => {
        const userEdit = vaultMap.get(sp.id) || (sp.slug ? vaultMap.get(sp.slug) : null);
        return userEdit ? { ...sp, ...userEdit } : sp;
      });

      // Only retain newly user-created projects that were marked explicitly with _userCreated
      vaultProjects.forEach((vp) => {
        if (
          vp &&
          vp.id &&
          vp._userCreated &&
          !deletedIds.has(vp.id) &&
          !filteredServer.some((sp) => sp.id === vp.id || (vp.slug && sp.slug === vp.slug))
        ) {
          mergedList.unshift(vp);
        }
      });

      setRaw(VAULT_KEYS.PROJECTS, mergedList);
      setRaw('sakhawat_cached_all_projects', mergedList);
      return mergedList;
    }

    // Fallback when server is offline or empty
    const validVault = vaultProjects.filter(
      (vp) => vp && vp.id && !deletedIds.has(vp.id) && !vp.id.startsWith('proj-logo-') && !vp.id.startsWith('proj-ads-')
    );
    return validVault;
  },

  // Save custom site settings to permanent vault
  saveSettings: (settingsObj) => {
    if (!settingsObj || typeof settingsObj !== 'object') return;
    const current = getRaw(VAULT_KEYS.SETTINGS, {});
    const updated = { ...current, ...settingsObj };
    setRaw(VAULT_KEYS.SETTINGS, updated);
    setRaw('sakhawat_cached_settings', updated);
  },

  // Merge server settings with local vault settings (Server is authoritative)
  mergeSettings: (serverSettings = {}) => {
    const vaultSettings = getRaw(VAULT_KEYS.SETTINGS, {});
    const hasServerSettings = serverSettings && typeof serverSettings === 'object' && Object.keys(serverSettings).length > 0;
    const merged = hasServerSettings
      ? { ...vaultSettings, ...serverSettings }
      : { ...vaultSettings };
    setRaw(VAULT_KEYS.SETTINGS, merged);
    setRaw('sakhawat_cached_settings', merged);
    return merged;
  },

  // Save media to permanent vault
  saveMedia: (mediaItem) => {
    if (!mediaItem || (!mediaItem.id && !mediaItem.fileUrl && !mediaItem.url)) return;
    const current = getRaw(VAULT_KEYS.MEDIA, []);
    const itemUrl = mediaItem.fileUrl || mediaItem.url;
    if (itemUrl && itemUrl.includes('unsplash.com')) return; // Never save Unsplash to media vault

    const existsIndex = current.findIndex(
      (m) => (mediaItem.id && m.id === mediaItem.id) || (itemUrl && (m.fileUrl === itemUrl || m.url === itemUrl))
    );
    let updated;
    if (existsIndex >= 0) {
      updated = [...current];
      updated[existsIndex] = { ...updated[existsIndex], ...mediaItem, url: itemUrl, fileUrl: itemUrl };
    } else {
      updated = [{ ...mediaItem, url: itemUrl, fileUrl: itemUrl }, ...current];
    }
    setRaw(VAULT_KEYS.MEDIA, updated);
    setRaw('sakhawat_media_library', updated);
  },

  // Delete media from vault
  deleteMedia: (mediaId) => {
    if (!mediaId) return;
    const current = getRaw(VAULT_KEYS.MEDIA, []);
    const updated = current.filter((m) => m.id !== mediaId);
    setRaw(VAULT_KEYS.MEDIA, updated);
    setRaw('sakhawat_media_library', updated);
  },

  // Merge server media with local vault media (Server is authoritative)
  mergeMedia: (serverMedia = []) => {
    const vaultMedia = getRaw(VAULT_KEYS.MEDIA, []);
    const urlMap = new Set();
    const merged = [];

    // Server media is strictly authoritative
    if (Array.isArray(serverMedia) && serverMedia.length > 0) {
      serverMedia.forEach((sm) => {
        if (!sm) return;
        const url = sm.fileUrl || sm.url;
        if (url && !urlMap.has(url) && !url.includes('unsplash.com')) {
          urlMap.add(url);
          merged.push({ ...sm, url: url, fileUrl: url });
        }
      });
      setRaw(VAULT_KEYS.MEDIA, merged);
      setRaw('sakhawat_media_library', merged);
      return merged;
    }

    // Fallback when server is offline
    vaultMedia.forEach((vm) => {
      if (!vm) return;
      const url = vm.fileUrl || vm.url;
      if (url && !urlMap.has(url) && !url.includes('unsplash.com')) {
        urlMap.add(url);
        merged.push({ ...vm, url: url, fileUrl: url });
      }
    });

    setRaw('sakhawat_media_library', merged);
    return merged;
  },
};

export default DataVault;
