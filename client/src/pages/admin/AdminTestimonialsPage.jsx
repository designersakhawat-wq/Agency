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
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { MediaSelectField } from '../../components/common/MediaSelectField';

import { DEFAULT_TESTIMONIALS } from '../../data/defaultData';
import { safeSetItem } from '../../utils/safeStorage';

export const AdminTestimonialsPage = () => {
  const { success, error } = useToast();
  const [testimonials, setTestimonials] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_testimonials');
      return cached ? JSON.parse(cached) : DEFAULT_TESTIMONIALS;
    } catch (e) {
      return DEFAULT_TESTIMONIALS;
    }
  });
  const [servicesList, setServicesList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    clientName: '',
    clientRole: 'Founder & CEO',
    clientCompany: '',
    clientAvatar: '',
    brandLogo: '',
    serviceId: '',
    content: '',
    rating: 5,
    projectTitle: '',
    status: 'APPROVED',
    featured: true,
    active: true,
    order: 0,
  });

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/testimonials/admin/all').catch(() => null);
      if (res && res.success && Array.isArray(res.data)) {
        setTestimonials(res.data);
        safeSetItem('sakhawat_cached_testimonials', res.data);
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    api.get('/services/admin/all')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setServicesList(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const openCreateModal = () => {
    setEditTarget(null);
    setFormData({
      clientName: '',
      clientRole: 'Founder & CEO',
      clientCompany: '',
      clientAvatar: '',
      brandLogo: '',
      serviceId: '',
      content: '',
      rating: 5,
      projectTitle: '',
      status: 'APPROVED',
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
      brandLogo: t.brandLogo || '',
      serviceId: t.serviceId || '',
      content: t.content,
      rating: t.rating || 5,
      projectTitle: t.projectTitle || '',
      status: t.status || 'APPROVED',
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
    data.append('altText', formData.clientName ? `${formData.clientName} Avatar` : 'Client Avatar');
    try {
      const res = await api.upload('/admin/media/upload', data);
      if (res.success && res.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, clientAvatar: res.data.fileUrl }));
        success('Client avatar uploaded successfully!');
      }
    } catch (err) {
      error('Avatar upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientCompany || !formData.content) {
      error('Client name, company, and review content are required.');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/testimonials/admin/${editTarget.id}`, formData);
        if (res.success) {
          success('Testimonial updated successfully!');
          fetchTestimonials();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/testimonials/admin', formData);
        if (res.success) {
          success('Testimonial added successfully!');
          fetchTestimonials();
          setModalOpen(false);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/testimonials/admin/${deleteTarget.id}`);
      if (res.success) {
        success('Testimonial deleted successfully.');
        setTestimonials((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      error(err.message || 'Failed to delete testimonial.');
    }
  };

  const filteredTestimonials = testimonials.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return (t.status || 'APPROVED') === statusFilter;
  });

  const getStatusBadge = (status = 'APPROVED') => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="emerald" size="sm">Approved</Badge>;
      case 'PENDING':
        return <Badge variant="amber" size="sm">Pending</Badge>;
      case 'DRAFT':
        return <Badge variant="default" size="sm">Draft</Badge>;
      case 'REJECTED':
        return <Badge variant="rose" size="sm">Rejected</Badge>;
      default:
        return <Badge variant="emerald" size="sm">Approved</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Testimonials & Reviews</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage client reviews, approval workflows, ratings, and service associations. Only approved reviews appear publicly.
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'APPROVED', 'PENDING', 'DRAFT', 'REJECTED'].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-teal-500 text-black shadow-md shadow-teal-950/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {st === 'ALL' ? 'All Reviews' : st}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredTestimonials.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between hover:border-teal-500/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusBadge(t.status)}
                  {t.featured && (
                    <Badge variant="amber" size="sm" dot>
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-300 italic mb-4 line-clamp-4 leading-relaxed">
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
                placeholder="e.g. David Miller"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Company / Brand *</label>
              <input
                type="text"
                value={formData.clientCompany}
                onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                placeholder="e.g. Fintech Startup (USA)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Client Role</label>
              <input
                type="text"
                value={formData.clientRole}
                onChange={(e) => setFormData({ ...formData, clientRole: e.target.value })}
                placeholder="e.g. Founder"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Approval Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
              >
                <option value="APPROVED">Approved (Public)</option>
                <option value="PENDING">Pending Review</option>
                <option value="DRAFT">Draft</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Rating (1-5)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value, 10) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
              >
                <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                <option value={3}>3 Stars ⭐⭐⭐</option>
              </select>
            </div>
          </div>

          {/* Client Avatar Selection (Media Library Only) */}
          <MediaSelectField
            label="Client Avatar Photo"
            value={formData.clientAvatar}
            onChange={(url) => setFormData((prev) => ({ ...prev, clientAvatar: url }))}
            helperText="Professional headshot or client photo (Square 1:1 recommended)."
            aspectRatio="aspect-square"
          />

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Review Content *</label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="What did the client say about your design quality, communication, and speed?"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:border-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded bg-zinc-950 border-zinc-800 text-teal-500 focus:ring-teal-500"
              />
              <span>⭐ Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded bg-zinc-950 border-zinc-800 text-teal-500 focus:ring-teal-500"
              />
              <span>Active (Visible)</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              {editTarget ? 'Save Changes' : 'Create Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the review by "${deleteTarget?.clientName}"?`}
        confirmLabel="Delete Review"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminTestimonialsPage;
