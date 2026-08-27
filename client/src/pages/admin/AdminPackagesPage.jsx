import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { DollarSign, Plus, Edit2, Trash2, Check, Sparkles } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

import { DEFAULT_PACKAGES, DEFAULT_SERVICES } from '../../data/defaultData';

export const AdminPackagesPage = () => {
  const { formatAmount, currencySymbol } = useCurrency();
  const [packages, setPackages] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_packages');
      return cached ? JSON.parse(cached) : DEFAULT_PACKAGES;
    } catch (e) {
      return DEFAULT_PACKAGES;
    }
  });
  const [services, setServices] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_services');
      return cached ? JSON.parse(cached) : DEFAULT_SERVICES;
    } catch (e) {
      return DEFAULT_SERVICES;
    }
  });
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    serviceId: '',
    description: '',
    price: 1999,
    billingPeriod: 'per-project',
    features: [],
    isPopular: false,
    order: 0,
    active: true,
    ctaText: 'Book Package',
  });

  const [featureInput, setFeatureInput] = useState('');

  const fetchPackages = async () => {
    try {
      const [pkgRes, srvRes] = await Promise.all([
        api.get('/packages/admin/all').catch(() => null),
        api.get('/services/admin/all').catch(() => null),
      ]);
      if (pkgRes && pkgRes.success && Array.isArray(pkgRes.data)) {
        setPackages(pkgRes.data);
        localStorage.setItem('sakhawat_cached_packages', JSON.stringify(pkgRes.data));
      }
      if (srvRes && srvRes.success && Array.isArray(srvRes.data)) {
        setServices(srvRes.data);
        localStorage.setItem('sakhawat_cached_services', JSON.stringify(srvRes.data));
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreateModal = () => {
    setEditTarget(null);
    setFormData({
      name: '',
      serviceId: services[0]?.id || '',
      description: '',
      price: 1999,
      billingPeriod: 'per-project',
      features: ['Up to 8 Key Screens', 'Interactive Figma Prototype', 'Design Handoff'],
      isPopular: false,
      order: packages.length + 1,
      active: true,
      ctaText: 'Book Package',
    });
    setModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditTarget(pkg);
    let parsedFeat = pkg.features;
    if (typeof parsedFeat === 'string') {
      try { parsedFeat = JSON.parse(parsedFeat); } catch (e) { parsedFeat = []; }
    }

    setFormData({
      name: pkg.name,
      serviceId: pkg.serviceId || '',
      description: pkg.description || '',
      price: Number(pkg.price),
      billingPeriod: pkg.billingPeriod || 'per-project',
      features: Array.isArray(parsedFeat) ? parsedFeat : [],
      isPopular: Boolean(pkg.isPopular),
      order: pkg.order || 0,
      active: pkg.active,
      ctaText: pkg.ctaText || 'Book Package',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.price === undefined) {
      error('Package name and price are required.');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/packages/admin/${editTarget.id}`, formData);
        if (res.success) {
          success('Package updated successfully.');
          fetchPackages();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/packages/admin', formData);
        if (res.success) {
          success('Package created successfully.');
          fetchPackages();
          setModalOpen(false);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save package.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/packages/admin/${deleteTarget.id}`);
      if (res.success) {
        success('Package deleted.');
        setPackages((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      error(err.message || 'Failed to delete package.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Pricing Packages</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure tiered pricing rates, features checklist, and highlight badges.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
          Add New Package
        </Button>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            let features = pkg.features;
            if (typeof features === 'string') {
              try { features = JSON.parse(features); } catch (e) { features = []; }
            }

            return (
              <div
                key={pkg.id}
                className="p-6 rounded-2xl glass-card border border-zinc-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-lg">{pkg.name}</h3>
                      {pkg.isPopular && (
                        <Badge variant="amber" size="sm">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <Badge variant={pkg.active ? 'emerald' : 'default'} size="sm">
                      {pkg.active ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>

                  <div className="text-2xl font-black font-display text-white mb-3">
                    {formatAmount(pkg.price)}{' '}
                    <span className="text-xs text-zinc-500 font-normal">/{pkg.billingPeriod}</span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{pkg.description}</p>

                  {Array.isArray(features) && features.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-zinc-800">
                      {features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-6 border-t border-zinc-800 flex items-center justify-end gap-2">
                  <Button variant="secondary" size="sm" icon={Edit2} onClick={() => openEditModal(pkg)}>
                    Edit
                  </Button>
                  <button
                    onClick={() => setDeleteTarget(pkg)}
                    className="p-2 rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Pricing Package' : 'Create Pricing Package'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Package Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Starter Brand Suite"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Associated Service</label>
              <select
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">None / General</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Price (USD) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Billing Period</label>
              <select
                value={formData.billingPeriod}
                onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="per-project">per-project</option>
                <option value="monthly">monthly</option>
                <option value="one-time">one-time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Features Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Included Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add package feature..."
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
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                />
                <span>Featured / Most Popular</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
                <span>Active</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                Save Package
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Package"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
};

export default AdminPackagesPage;
