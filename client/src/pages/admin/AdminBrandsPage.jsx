import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

import { DEFAULT_BRANDS } from '../../data/defaultData';
import { safeSetItem } from '../../utils/safeStorage';

export const AdminBrandsPage = () => {
  const [brands, setBrands] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_brands');
      return cached ? JSON.parse(cached) : DEFAULT_BRANDS;
    } catch (e) {
      return DEFAULT_BRANDS;
    }
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    websiteUrl: '',
    order: 0,
    active: true,
  });

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands/admin/all').catch(() => null);
      if (res && res.success && Array.isArray(res.data)) {
        setBrands(res.data);
        safeSetItem('sakhawat_cached_brands', res.data);
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditTarget(null);
    setFormData({
      name: '',
      logoUrl: '',
      websiteUrl: '',
      order: brands.length + 1,
      active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (brand) => {
    setEditTarget(brand);
    setFormData({
      name: brand.name,
      logoUrl: brand.logoUrl || '',
      websiteUrl: brand.websiteUrl || '',
      order: brand.order || 0,
      active: brand.active,
    });
    setModalOpen(true);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const data = new FormData();
    data.append('file', file);
    data.append('altText', formData.name ? `${formData.name} Logo` : 'Client Brand Logo');
    try {
      const res = await api.upload('/admin/media/upload', data);
      if (res.success && res.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, logoUrl: res.data.fileUrl }));
        showToast('Brand logo uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Logo upload failed: ' + err.message, 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Brand name is required.', 'error');
      return;
    }

    const payload = {
      ...formData,
      logoUrl:
        formData.logoUrl ||
        `https://placehold.co/180x60/18181b/ffffff?text=${encodeURIComponent(formData.name)}`,
    };

    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/brands/admin/${editTarget.id}`, payload);
        if (res.success) {
          showToast('Brand updated successfully!', 'success');
          fetchBrands();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/brands/admin', payload);
        if (res.success) {
          showToast('Brand created successfully!', 'success');
          fetchBrands();
          setModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save brand.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/brands/admin/${deleteTarget.id}`);
      if (res.success) {
        showToast('Brand deleted successfully.', 'success');
        setBrands((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete brand.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Client Brands & Logos</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage partner logos displayed on the homepage marquee ribbon.
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={openCreateModal} className="cursor-pointer font-bold shadow-lg">
          Add Brand
        </Button>
      </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {brands.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl glass-card border border-zinc-800 flex flex-col justify-between items-center text-center group hover:border-teal-500/40 transition-all"
            >
              <div className="w-full flex items-center justify-between mb-3">
                <Badge variant={b.active ? 'emerald' : 'default'} size="sm">
                  {b.active ? 'Active' : 'Hidden'}
                </Badge>
                <span className="text-[10px] text-zinc-500 font-mono">#{b.order}</span>
              </div>

              <div className="w-full h-16 bg-zinc-900/90 rounded-xl border border-zinc-800 flex items-center justify-center p-3 mb-3">
                {b.logoUrl ? (
                  <img
                    src={b.logoUrl}
                    alt={b.name}
                    className="max-h-10 max-w-[85%] object-contain"
                  />
                ) : (
                  <span className="font-display font-black text-sm text-zinc-300 truncate">
                    {b.name}
                  </span>
                )}
              </div>

              <div className="w-full space-y-1 mb-3">
                <div className="text-xs font-bold text-white truncate">{b.name}</div>
                {b.websiteUrl && (
                  <a
                    href={b.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-teal-400 hover:underline flex items-center justify-center gap-1"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>

              <div className="w-full flex items-center justify-center gap-2 pt-3 border-t border-zinc-800/60">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(b)} className="cursor-pointer">
                  Edit
                </Button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(b)}
                  className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                  title="Delete Brand"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? `Edit Brand: ${editTarget.name}` : 'Add New Client Brand'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Brand Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. e-Learn IT Institute"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Brand Logo (ইমেজ আপলোড বা লিংক)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="e.g. /uploads/brand-logo.png or https://..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Upload}
                isLoading={uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer shrink-0"
              >
                Upload
              </Button>
            </div>

            {formData.logoUrl && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3 mt-2">
                <img
                  src={formData.logoUrl}
                  alt="Preview"
                  className="h-8 max-h-8 max-w-[120px] object-contain rounded"
                />
                <span className="text-[11px] text-emerald-400 font-mono">Active Logo Preview</span>
              </div>
            )}

            <p className="text-[11px] text-teal-400 mt-1.5">
              📐 রিকমেন্ডেশন: <strong>Transparent PNG / SVG</strong> • ডাইমেনশন: <strong>400 × 120 px</strong> • সাইজ: <strong>Under 150 KB</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Website URL (Optional)</label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://example.com"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded text-teal-500 bg-zinc-950 border-zinc-700 accent-teal-500"
              />
              <span className="font-semibold">Active in Ribbon</span>
            </label>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                {editTarget ? 'Save Changes' : 'Create Brand'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Brand"
        message={`Are you sure you want to remove "${deleteTarget?.name}"?`}
        confirmText="Yes, Delete Brand"
        variant="danger"
      />
    </div>
  );
};

export default AdminBrandsPage;
