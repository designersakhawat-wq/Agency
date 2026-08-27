import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquareQuote,
  Plus,
  Edit2,
  Trash2,
  Star,
  Upload,
  Image as ImageIcon,
  Check,
  User,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

import { DEFAULT_TESTIMONIALS } from '../../data/defaultData';

export const AdminTestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_testimonials');
      return cached ? JSON.parse(cached) : DEFAULT_TESTIMONIALS;
    } catch (e) {
      return DEFAULT_TESTIMONIALS;
    }
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    clientName: '',
    clientRole: 'CEO',
    clientCompany: '',
    clientAvatar: '',
    content: '',
    rating: 5,
    projectTitle: '',
    featured: true,
    active: true,
    order: 0,
  });

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/testimonials/admin/all').catch(() => null);
      if (res && res.success && Array.isArray(res.data)) {
        setTestimonials(res.data);
        localStorage.setItem('sakhawat_cached_testimonials', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateModal = () => {
    setEditTarget(null);
    setFormData({
      clientName: '',
      clientRole: 'Head of Product',
      clientCompany: '',
      clientAvatar: '',
      content: '',
      rating: 5,
      projectTitle: '',
      featured: true,
      active: true,
      order: testimonials.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditTarget(t);
    setFormData({
      clientName: t.clientName,
      clientRole: t.clientRole || '',
      clientCompany: t.clientCompany || '',
      clientAvatar: t.clientAvatar || '',
      content: t.content,
      rating: t.rating || 5,
      projectTitle: t.projectTitle || '',
      featured: Boolean(t.featured),
      active: t.active !== false,
      order: t.order || 0,
    });
    setModalOpen(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const data = new FormData();
    data.append('file', file);
    data.append('altText', formData.clientName ? `${formData.clientName} Avatar` : 'Client Testimonial Avatar');
    try {
      const res = await api.upload('/admin/media/upload', data);
      if (res.success && res.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, clientAvatar: res.data.fileUrl }));
        showToast('Client avatar uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Avatar upload failed: ' + err.message, 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientCompany || !formData.content) {
      showToast('Client name, company, and review content are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/testimonials/admin/${editTarget.id}`, formData);
        if (res.success) {
          showToast('Testimonial updated successfully!', 'success');
          fetchTestimonials();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/testimonials/admin', formData);
        if (res.success) {
          showToast('Testimonial added successfully!', 'success');
          fetchTestimonials();
          setModalOpen(false);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save testimonial.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/testimonials/admin/${deleteTarget.id}`);
      if (res.success) {
        showToast('Testimonial deleted successfully.', 'success');
        setTestimonials((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete testimonial.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden Avatar File Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Client Testimonials</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage client reviews, avatar images, star ratings, and company roles.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          icon={Plus}
          onClick={openCreateModal}
          className="cursor-pointer font-bold shadow-lg"
        >
          Add Testimonial
        </Button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 rounded-2xl glass-card border border-zinc-800 flex flex-col justify-between hover:border-teal-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.featured && (
                      <Badge variant="amber" size="sm" dot>
                        Featured
                      </Badge>
                    )}
                    <Badge variant={t.active ? 'emerald' : 'default'} size="sm">
                      {t.active ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 italic mb-4 line-clamp-3 leading-relaxed">
                  "{t.content}"
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
                  {t.clientAvatar ? (
                    <img
                      src={t.clientAvatar}
                      alt={t.clientName}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {t.clientName ? t.clientName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{t.clientName}</h4>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {t.clientRole}, {t.clientCompany}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Edit2}
                  onClick={() => openEditModal(t)}
                  className="cursor-pointer"
                >
                  Edit
                </Button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(t)}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? `Edit Review: ${editTarget.clientName}` : 'Add New Client Testimonial'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Client Name *</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Elena Rostova"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Company *</label>
              <input
                type="text"
                value={formData.clientCompany}
                onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                placeholder="e.g. Rostova Health & Beauty"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Role / Title</label>
              <input
                type="text"
                value={formData.clientRole}
                onChange={(e) => setFormData({ ...formData, clientRole: e.target.value })}
                placeholder="e.g. Operations Lead"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Star Rating (1 - 5)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Outstanding)</option>
                <option value={4}>⭐⭐⭐⭐ 4 Stars (Great)</option>
                <option value={3}>⭐⭐⭐ 3 Stars (Average)</option>
              </select>
            </div>
          </div>

          {/* Client Avatar Upload Section */}
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">
              Client Avatar Image (ছবি আপলোড বা লিংক)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.clientAvatar}
                onChange={(e) => setFormData({ ...formData, clientAvatar: e.target.value })}
                placeholder="e.g. /uploads/avatar.png or https://..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500 font-mono"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Upload}
                isLoading={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer shrink-0"
              >
                Upload Photo
              </Button>
            </div>

            {formData.clientAvatar && (
              <div className="flex items-center gap-3 pt-1">
                <img
                  src={formData.clientAvatar}
                  alt="Avatar preview"
                  className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                />
                <span className="text-[11px] text-emerald-400 font-mono">Active Avatar Preview</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Review Content *</label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="The thumbnail designs and short-form video pacing Sakhawat developed gave our content the professional edge it needed..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3.5 text-white text-xs leading-relaxed focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700 accent-amber-500"
                />
                <span>⭐ Featured</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-500 bg-zinc-950 border-zinc-700 accent-teal-500"
                />
                <span>🟢 Published</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                {editTarget ? 'Save Testimonial' : 'Create Testimonial'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message={`Are you sure you want to remove the review from "${deleteTarget?.clientName}"?`}
        confirmText="Yes, Delete Testimonial"
        variant="danger"
      />
    </div>
  );
};

export default AdminTestimonialsPage;
