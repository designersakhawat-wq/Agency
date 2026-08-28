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
  Building,
  Clock,
  Save,
  StickyNote,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';

const LEAD_STATUSES = [
  'ALL',
  'NEW',
  'CONTACTED',
  'IN_DISCUSSION',
  'CONVERTED',
  'CLOSED',
  'SPAM',
];

const getStatusBadge = (status = 'NEW') => {
  switch (status) {
    case 'NEW':
    case 'UNREAD':
      return <Badge variant="rose" size="sm">New Lead</Badge>;
    case 'CONTACTED':
      return <Badge variant="amber" size="sm">Contacted</Badge>;
    case 'IN_DISCUSSION':
      return <Badge variant="purple" size="sm">In Discussion</Badge>;
    case 'CONVERTED':
      return <Badge variant="emerald" size="sm">Converted ($)</Badge>;
    case 'CLOSED':
      return <Badge variant="default" size="sm">Closed</Badge>;
    case 'SPAM':
      return <Badge variant="rose" size="sm">Spam</Badge>;
    default:
      return <Badge variant="default" size="sm">{status}</Badge>;
  }
};

export const AdminInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const { success, error } = useToast();

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inquiries/admin/all', {
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search || undefined,
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

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    try {
      const res = await api.put(`/inquiries/admin/${selectedInquiry.id}`, { notes: notesDraft });
      if (res.success) {
        success('Internal lead notes saved.');
        setInquiries((prev) =>
          prev.map((item) => (item.id === selectedInquiry.id ? { ...item, notes: notesDraft } : item))
        );
        setSelectedInquiry((prev) => ({ ...prev, notes: notesDraft }));
      }
    } catch (err) {
      error(err.message || 'Failed to save notes.');
    } finally {
      setSavingNotes(false);
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
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Project Inquiries & Leads</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage incoming client inquiries, lead statuses, communication logs, and internal notes.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {LEAD_STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-teal-500 text-black shadow-md shadow-teal-950/40'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {st === 'ALL' ? 'All Leads' : st.replace('_', ' ')}
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
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Inquiries Table */}
      {inquiries.length === 0 && !loading ? (
        <div className="text-center py-20 bg-zinc-900/40 rounded-2xl border border-zinc-800 space-y-3">
          <Inbox className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Inquiries Found</h3>
          <p className="text-xs text-zinc-400">No project inquiries matching current filter criteria.</p>
        </div>
      ) : (
        <div className="bg-zinc-900/60 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Client / Company</th>
                  <th className="p-4">Attribution / Source</th>
                  <th className="p-4">Subject & Message</th>
                  <th className="p-4">Service & Budget</th>
                  <th className="p-4">Lead Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {inquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className={`hover:bg-zinc-850/50 transition-colors ${
                      inq.status === 'NEW' || inq.status === 'UNREAD' ? 'bg-teal-950/15 font-medium' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span className="font-bold text-white block">{inq.name}</span>
                      <a
                        href={`mailto:${inq.email}`}
                        className="text-[11px] text-teal-400 hover:underline block truncate"
                      >
                        {inq.email}
                      </a>
                      {inq.company && <span className="text-[10px] text-zinc-400 block">{inq.company}</span>}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[11px] font-bold">
                        <Tag className="w-3 h-3 text-teal-400" />
                        <span>{inq.utmSource || 'Direct / Organic'}</span>
                      </span>
                      {inq.utmCampaign && inq.utmCampaign !== 'direct' && inq.utmCampaign !== 'organic_visit' && (
                        <span className="text-[10px] text-zinc-400 block mt-1 font-mono truncate max-w-[140px]" title={inq.utmCampaign}>
                          📢 {inq.utmCampaign}
                        </span>
                      )}
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
                      <span className="text-[11px] text-amber-400 font-bold">{inq.budget || '—'}</span>
                    </td>

                    <td className="p-4">
                      {getStatusBadge(inq.status)}
                    </td>

                    <td className="p-4 text-zinc-400 whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedInquiry(inq);
                            setNotesDraft(inq.notes || '');
                            if (inq.status === 'NEW' || inq.status === 'UNREAD') {
                              handleUpdateStatus(inq.id, 'CONTACTED');
                            }
                          }}
                          className="cursor-pointer"
                        >
                          View Lead
                        </Button>
                        <a
                          href={`mailto:${inq.email}?subject=Re:%20${encodeURIComponent(
                            inq.subject || 'Creative Project Inquiry'
                          )}`}
                          onClick={() => handleUpdateStatus(inq.id, 'CONTACTED')}
                          className="p-2 rounded-lg bg-teal-500/10 text-teal-300 hover:bg-teal-600 hover:text-black transition-colors"
                          title="Reply via Email"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(inq)}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
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

      {/* DETAIL & LEAD NOTES MODAL */}
      <Modal
        isOpen={Boolean(selectedInquiry)}
        onClose={() => setSelectedInquiry(null)}
        title="Project Inquiry Details & Notes"
        maxWidth="max-w-2xl"
      >
        {selectedInquiry && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedInquiry.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                    <a href={`mailto:${selectedInquiry.email}`} className="text-teal-400 hover:underline">
                      {selectedInquiry.email}
                    </a>
                    {selectedInquiry.phone && <span>• {selectedInquiry.phone}</span>}
                    {selectedInquiry.company && <span>• {selectedInquiry.company}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleUpdateStatus(selectedInquiry.id, e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-teal-500 focus:outline-none"
                  >
                    <option value="NEW">New Lead</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="IN_DISCUSSION">In Discussion</option>
                    <option value="CONVERTED">Converted ($)</option>
                    <option value="CLOSED">Closed</option>
                    <option value="SPAM">Spam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Service</span>
                  <span className="font-semibold text-white">{selectedInquiry.service || 'General'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Budget</span>
                  <span className="font-semibold text-amber-400">{selectedInquiry.budget || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Received</span>
                  <span className="font-semibold text-white">{new Date(selectedInquiry.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Lead Attribution</span>
                  <span className="font-bold text-teal-400">{selectedInquiry.utmSource || 'Direct'}</span>
                </div>
              </div>

              {/* Extended Campaign & Ad Details */}
              {(selectedInquiry.utmSource || selectedInquiry.utmCampaign || selectedInquiry.landingPage) && (
                <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-teal-500/20 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    <span>Meta Ads / Campaign Attribution Breakdown</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-zinc-300">
                    <div>
                      <span className="text-zinc-500 block">Traffic Source:</span>
                      <span className="font-semibold text-white">{selectedInquiry.utmSource || 'Direct / Organic'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Campaign Name:</span>
                      <span className="font-semibold text-white">{selectedInquiry.utmCampaign || '—'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Medium / Placement:</span>
                      <span className="font-semibold text-white">{selectedInquiry.utmMedium || '—'}</span>
                    </div>
                    {selectedInquiry.utmContent && (
                      <div>
                        <span className="text-zinc-500 block">Ad Creative / Content:</span>
                        <span className="font-semibold text-white">{selectedInquiry.utmContent}</span>
                      </div>
                    )}
                    {selectedInquiry.landingPage && (
                      <div className="col-span-2">
                        <span className="text-zinc-500 block">Landing Page URL:</span>
                        <span className="font-mono text-zinc-400 break-all">{selectedInquiry.landingPage}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Client Message
              </label>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-teal-400" />
                <span>Internal Lead Notes & Follow-up Log</span>
              </label>
              <textarea
                rows={3}
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Add notes about client discussions, proposal sent, agreed deliverables, budget adjustments..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:border-teal-500 focus:outline-none"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Save}
                  onClick={handleSaveNotes}
                  loading={savingNotes}
                >
                  Save Internal Notes
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re:%20${encodeURIComponent(
                  selectedInquiry.subject || 'Your Creative Project Inquiry'
                )}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-black font-bold text-xs hover:bg-teal-400 transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>Reply to Client via Email</span>
              </a>

              <Button variant="ghost" size="sm" onClick={() => setSelectedInquiry(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Inquiry"
        message={`Are you sure you want to delete the inquiry from "${deleteTarget?.name}"?`}
        confirmLabel="Delete Inquiry"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminInquiriesPage;
