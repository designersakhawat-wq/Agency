import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Inbox,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Trash2,
  Reply,
  Search,
  MessageSquare,
  DollarSign,
  Tag,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

const statusVariants = {
  UNREAD: 'rose',
  READ: 'default',
  REPLIED: 'emerald',
  ARCHIVED: 'purple',
};

const AdminInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const { success, error } = useToast();

  const fetchInquiries = async () => {
    try {
      const res = await api.get('/inquiries/admin/all', {
        status: statusFilter,
        search,
      }).catch(() => null);
      if (res && res.success && Array.isArray(res.data)) {
        setInquiries(res.data);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/inquiries/admin/${id}`, { status });
      if (res.success) {
        success(`Inquiry status updated to ${status}.`);
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
        if (selectedInquiry?.id === id) {
          setSelectedInquiry((prev) => ({ ...prev, status }));
        }
      }
    } catch (err) {
      error(err.message || 'Status update failed.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/inquiries/admin/${deleteTarget.id}`);
      if (res.success) {
        success('Inquiry removed.');
        setInquiries((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        setDeleteTarget(null);
        if (selectedInquiry?.id === deleteTarget.id) setSelectedInquiry(null);
      }
    } catch (err) {
      error(err.message || 'Failed to delete inquiry.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Contact Inquiries Inbox</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Client messages dispatched from the public portfolio contact form.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl glass-card border border-zinc-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'UNREAD', 'READ', 'REPLIED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchInquiries()}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Inquiries Table / List */}
      {inquiries.length === 0 && !loading ? (
        <div className="text-center py-20 glass-card rounded-2xl border border-zinc-800 space-y-3">
          <Inbox className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Inbox Clean</h3>
          <p className="text-xs text-zinc-400">No inquiries matching current filter criteria.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Sender</th>
                  <th className="p-4">Subject & Message</th>
                  <th className="p-4">Service / Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {inquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className={`hover:bg-zinc-850/50 transition-colors ${
                      inq.status === 'UNREAD' ? 'bg-indigo-950/20 font-medium' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span className="font-bold text-white block">{inq.name}</span>
                      <a
                        href={`mailto:${inq.email}`}
                        className="text-[11px] text-indigo-400 hover:underline block truncate"
                      >
                        {inq.email}
                      </a>
                      {inq.phone && <span className="text-[10px] text-zinc-500">{inq.phone}</span>}
                    </td>

                    <td className="p-4 max-w-xs">
                      <span className="font-semibold text-white block truncate mb-1">
                        {inq.subject || 'Project Inquiry'}
                      </span>
                      <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                        {inq.message}
                      </p>
                    </td>

                    <td className="p-4">
                      <span className="text-xs text-zinc-200 block">{inq.service || 'General'}</span>
                      <span className="text-[11px] text-amber-400">{inq.budget || '—'}</span>
                    </td>

                    <td className="p-4">
                      <Badge variant={statusVariants[inq.status] || 'default'} size="sm">
                        {inq.status}
                      </Badge>
                    </td>

                    <td className="p-4 text-zinc-400 whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            if (inq.status === 'UNREAD') {
                              handleUpdateStatus(inq.id, 'READ');
                            }
                          }}
                        >
                          View Details
                        </Button>
                        <a
                          href={`mailto:${inq.email}?subject=Re:%20${encodeURIComponent(
                            inq.subject || 'Your Inquiry'
                          )}`}
                          onClick={() => handleUpdateStatus(inq.id, 'REPLIED')}
                          className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                          title="Reply via Email"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setDeleteTarget(inq)}
                          className="p-2 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={Boolean(selectedInquiry)}
          onClose={() => setSelectedInquiry(null)}
          title={`Inquiry from ${selectedInquiry.name}`}
          subtitle={`Received on ${new Date(selectedInquiry.createdAt).toLocaleString()}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500 block mb-1">Email</span>
                <a href={`mailto:${selectedInquiry.email}`} className="text-indigo-400 font-bold hover:underline">
                  {selectedInquiry.email}
                </a>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Phone</span>
                <span className="text-white font-bold">{selectedInquiry.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Service Requested</span>
                <span className="text-emerald-400 font-bold">{selectedInquiry.service || 'General'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Estimated Budget</span>
                <span className="text-amber-400 font-bold">{selectedInquiry.budget || 'Unspecified'}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase text-zinc-400 block mb-2">Message Content</span>
              <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Status Changer & Reply */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-semibold">Change Status:</span>
                {['UNREAD', 'READ', 'REPLIED', 'ARCHIVED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedInquiry.id, st)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      selectedInquiry.status === st
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <a
                href={`mailto:${selectedInquiry.email}?subject=Re:%20${encodeURIComponent(
                  selectedInquiry.subject || 'Your Inquiry to Md Sakhawat Hossain'
                )}`}
                onClick={() => handleUpdateStatus(selectedInquiry.id, 'REPLIED')}
              >
                <Button variant="primary" size="sm" icon={Reply}>
                  Reply Directly
                </Button>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Contact Inquiry"
        message={`Are you sure you want to remove inquiry from "${deleteTarget?.name}"?`}
      />
    </div>
  );
};

export default AdminInquiriesPage;
