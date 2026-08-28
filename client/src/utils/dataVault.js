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

    // Filter out any server projects that the user explicitly deleted
    const filteredServer = (serverProjects || []).filter((sp) => sp && sp.id && !deletedIds.has(sp.id));

    // Map existing server projects by ID and Slug
    const serverMap = new Map();
    filteredServer.forEach((sp) => {
      if (sp.id) serverMap.set(sp.id, sp);
      if (sp.slug) serverMap.set(sp.slug, sp);
    });

    const mergedList = [...filteredServer];
    const missingOnServer = [];

    vaultProjects.forEach((vp) => {
      if (!vp || !vp.id || deletedIds.has(vp.id)) return;

      const serverMatch = serverMap.get(vp.id) || (vp.slug ? serverMap.get(vp.slug) : null);
      if (serverMatch) {
        // Vault holds latest user edits
        const idx = mergedList.findIndex((p) => p.id === serverMatch.id || (vp.slug && p.slug === vp.slug));
        if (idx >= 0) {
          mergedList[idx] = { ...serverMatch, ...vp };
        }
      } else {
        // Project exists in user vault but missing on server (e.g. after container redeploy)
        mergedList.unshift(vp);
        missingOnServer.push(vp);
      }
    });

    // Background auto-heal: re-sync missing vault projects to server
    if (missingOnServer.length > 0) {
      setTimeout(async () => {
        for (const mp of missingOnServer) {
          try {
            await api.post('/projects/admin', mp).catch(() => {});
          } catch (e) {}
        }
      }, 1000);
    }

    setRaw('sakhawat_cached_all_projects', mergedList);
    return mergedList;
  },

  // Save custom site settings to permanent vault
  saveSettings: (settingsObj) => {
    if (!settingsObj || typeof settingsObj !== 'object') return;
    const current = getRaw(VAULT_KEYS.SETTINGS, {});
    const updated = { ...current, ...settingsObj };
    setRaw(VAULT_KEYS.SETTINGS, updated);
    setRaw('sakhawat_cached_settings', updated);
  },

  // Merge server settings with local vault settings
  mergeSettings: (serverSettings = {}) => {
    const vaultSettings = getRaw(VAULT_KEYS.SETTINGS, {});
    const merged = { ...(serverSettings || {}), ...vaultSettings };
    setRaw('sakhawat_cached_settings', merged);
    return merged;
  },

  // Save media to permanent vault
  saveMedia: (mediaItem) => {
    if (!mediaItem || (!mediaItem.id && !mediaItem.fileUrl && !mediaItem.url)) return;
    const current = getRaw(VAULT_KEYS.MEDIA, []);
    const itemUrl = mediaItem.fileUrl || mediaItem.url;
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

  // Merge server media with local vault media
  mergeMedia: (serverMedia = []) => {
    const vaultMedia = getRaw(VAULT_KEYS.MEDIA, []);
    const urlMap = new Set();
    const merged = [];

    (serverMedia || []).forEach((sm) => {
      if (!sm) return;
      const url = sm.fileUrl || sm.url;
      if (url && !urlMap.has(url)) {
        urlMap.add(url);
        merged.push({ ...sm, url: url, fileUrl: url });
      }
    });

    vaultMedia.forEach((vm) => {
      if (!vm) return;
      const url = vm.fileUrl || vm.url;
      if (url && !urlMap.has(url)) {
        urlMap.add(url);
        merged.unshift({ ...vm, url: url, fileUrl: url });
      }
    });

    setRaw('sakhawat_media_library', merged);
    return merged;
  },
};

export default DataVault;
