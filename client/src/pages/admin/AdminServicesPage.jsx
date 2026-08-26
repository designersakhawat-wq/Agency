import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Layers, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    icon: 'Palette',
    features: [],
    deliverables: [],
    order: 0,
    active: true,
  });

  const [featureInput, setFeatureInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services/admin/all');
      if (res.success) setServices(res.data || []);
    } catch (err) {
      error('Failed to load services: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditTarget(null);
    setFormData({
      title: '',
      tagline: '',
      description: '',
      icon: 'Palette',
      features: ['High-Fidelity Wireframes', 'Interactive Figma Prototype'],
      deliverables: ['Master Figma Library', 'Clean Export Assets'],
      order: services.length + 1,
      active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditTarget(service);
    let parsedFeat = service.features;
    if (typeof parsedFeat === 'string') {
      try { parsedFeat = JSON.parse(parsedFeat); } catch (e) { parsedFeat = []; }
    }
    let parsedDel = service.deliverables;
    if (typeof parsedDel === 'string') {
      try { parsedDel = JSON.parse(parsedDel); } catch (e) { parsedDel = []; }
    }

    setFormData({
      title: service.title,
      tagline: service.tagline || '',
      description: service.description,
      icon: service.icon || 'Palette',
      features: Array.isArray(parsedFeat) ? parsedFeat : [],
      deliverables: Array.isArray(parsedDel) ? parsedDel : [],
      order: service.order || 0,
      active: service.active,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      error('Title and description are required.');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/services/admin/${editTarget.id}`, formData);
        if (res.success) {
          success('Service updated successfully.');
          fetchServices();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/services/admin', formData);
        if (res.success) {
          success('Service created successfully.');
          fetchServices();
          setModalOpen(false);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/services/admin/${deleteTarget.id}`);
      if (res.success) {
        success('Service deleted.');
        setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      error(err.message || 'Failed to delete service.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Services Management</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure service offerings, deliverables checklist, and capabilities.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
          Add New Service
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading services..." fullScreen />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => {
            let features = s.features;
            if (typeof features === 'string') {
              try { features = JSON.parse(features); } catch (e) { features = []; }
            }

            return (
              <div
                key={s.id}
                className="p-6 rounded-2xl glass-card border border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{s.title}</span>
                      <Badge variant={s.active ? 'emerald' : 'default'} size="sm">
                        {s.active ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">Order: {s.order}</span>
                  </div>

                  {s.tagline && <p className="text-xs text-indigo-400 mb-2 font-medium">{s.tagline}</p>}
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{s.description}</p>

                  {Array.isArray(features) && features.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-zinc-800">
                      {features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-end gap-2">
                  <Button variant="secondary" size="sm" icon={Edit2} onClick={() => openEditModal(s)}>
                    Edit
                  </Button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="p-2 rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Service' : 'Add New Service'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. UI/UX & Product Design"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Human-centered digital products"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Features Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Features Checklist</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add feature and press Add..."
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (featureInput.trim()) {
                      setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
                      setFeatureInput('');
                    }
                  }
                }}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (featureInput.trim()) {
                    setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
                    setFeatureInput('');
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <span>{f}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, features: formData.features.filter((_, idx) => idx !== i) })}
                    className="text-zinc-500 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <span>Active</span>
            </label>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                Save Service
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
      />
    </div>
  );
};

export default AdminServicesPage;
