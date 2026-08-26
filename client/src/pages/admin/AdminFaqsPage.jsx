import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { HelpCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

const AdminFaqsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    active: true,
  });

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faqs/admin/all');
      if (res.success) setFaqs(res.data || []);
    } catch (err) {
      error('Failed to load FAQs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditTarget(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      order: faqs.length + 1,
      active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditTarget(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      order: faq.order || 0,
      active: faq.active,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      error('Question and answer are required.');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/faqs/admin/${editTarget.id}`, formData);
        if (res.success) {
          success('FAQ updated.');
          fetchFaqs();
          setModalOpen(false);
        }
      } else {
        const res = await api.post('/faqs/admin', formData);
        if (res.success) {
          success('FAQ created.');
          fetchFaqs();
          setModalOpen(false);
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/faqs/admin/${deleteTarget.id}`);
      if (res.success) {
        success('FAQ deleted.');
        setFaqs((prev) => prev.filter((f) => f.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      error(err.message || 'Failed to delete FAQ.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Frequently Asked Questions</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage FAQs categorized by Process, Pricing, and Deliverables.
          </p>
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={openCreateModal}>
          Add New FAQ
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading FAQs..." fullScreen />
      ) : (
        <div className="space-y-4">
          {faqs.map((f) => (
            <div
              key={f.id}
              className="p-6 rounded-2xl glass-card border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="brand" size="sm">
                    {f.category}
                  </Badge>
                  <Badge variant={f.active ? 'emerald' : 'default'} size="sm">
                    {f.active ? 'Active' : 'Hidden'}
                  </Badge>
                </div>
                <h3 className="font-bold text-white text-base">{f.question}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{f.answer}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" size="sm" icon={Edit2} onClick={() => openEditModal(f)}>
                  Edit
                </Button>
                <button
                  onClick={() => setDeleteTarget(f)}
                  className="p-2 rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit FAQ' : 'Add FAQ'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="General">General</option>
              <option value="Process">Process</option>
              <option value="Pricing">Pricing</option>
              <option value="Deliverables">Deliverables</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Question *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Answer *</label>
            <textarea
              rows={4}
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              required
            />
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

            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              Save FAQ
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete FAQ"
        message={`Are you sure you want to delete this FAQ question?`}
      />
    </div>
  );
};

export default AdminFaqsPage;
