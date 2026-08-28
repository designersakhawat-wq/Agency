import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Video,
  User,
  Mail,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  ExternalLink,
  Edit2,
  Tag,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

const bookingStatuses = {
  PENDING: 'amber',
  CONFIRMED: 'emerald',
  COMPLETED: 'brand',
  CANCELLED: 'rose',
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [meetingLinkInput, setMeetingLinkInput] = useState('');
  const [savingLink, setSavingLink] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { success, error } = useToast();

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/admin/all', {
        status: statusFilter,
      }).catch(() => null);
      if (res && res.success && Array.isArray(res.data)) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/bookings/admin/${id}`, { status });
      if (res.success) {
        success(`Booking marked as ${status}.`);
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
        if (selectedBooking?.id === id) {
          setSelectedBooking((prev) => ({ ...prev, status }));
        }
      }
    } catch (err) {
      error(err.message || 'Failed to update status.');
    }
  };

  const handleSaveMeetingLink = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setSavingLink(true);

    try {
      const res = await api.put(`/bookings/admin/${selectedBooking.id}`, {
        meetingLink: meetingLinkInput,
        status: selectedBooking.status === 'PENDING' ? 'CONFIRMED' : selectedBooking.status,
      });

      if (res.success) {
        success('Meeting link saved and updated.');
        setBookings((prev) =>
          prev.map((b) =>
            b.id === selectedBooking.id
              ? {
                  ...b,
                  meetingLink: meetingLinkInput,
                  status: b.status === 'PENDING' ? 'CONFIRMED' : b.status,
                }
              : b
          )
        );
        setSelectedBooking((prev) => ({
          ...prev,
          meetingLink: meetingLinkInput,
          status: prev.status === 'PENDING' ? 'CONFIRMED' : prev.status,
        }));
      }
    } catch (err) {
      error(err.message || 'Failed to save meeting link.');
    } finally {
      setSavingLink(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/bookings/admin/${deleteTarget.id}`);
      if (res.success) {
        success('Booking deleted.');
        setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        setDeleteTarget(null);
        if (selectedBooking?.id === deleteTarget.id) setSelectedBooking(null);
      }
    } catch (err) {
      error(err.message || 'Failed to delete booking.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Discovery Call Bookings</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage scheduled video appointments, client consultation topics, and Google Meet/Zoom links.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 p-4 rounded-xl glass-card border border-zinc-800">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
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

      {/* Bookings Table */}
      {bookings.length === 0 && !loading ? (
        <div className="text-center py-20 glass-card rounded-2xl border border-zinc-800 space-y-3">
          <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Scheduled Bookings</h3>
          <p className="text-xs text-zinc-400">Your meeting schedule is open.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Attribution / Source</th>
                  <th className="p-4">Topic / Service</th>
                  <th className="p-4">Appointment Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Meeting Link</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-850/50 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-white block">{b.name}</span>
                      <a href={`mailto:${b.email}`} className="text-[11px] text-teal-400 hover:underline">
                        {b.email}
                      </a>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[11px] font-bold">
                        <Tag className="w-3 h-3 text-teal-400" />
                        <span>{b.utmSource || 'Direct / Organic'}</span>
                      </span>
                      {b.utmCampaign && b.utmCampaign !== 'direct' && (
                        <span className="text-[10px] text-zinc-400 block mt-1 font-mono truncate max-w-[130px]" title={b.utmCampaign}>
                          📢 {b.utmCampaign}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="text-xs text-zinc-200 block">{b.serviceName || 'Consultation'}</span>
                      {b.notes && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{b.notes}</p>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{b.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{b.timeSlot}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge variant={bookingStatuses[b.status] || 'default'} size="sm">
                        {b.status}
                      </Badge>
                    </td>

                    <td className="p-4">
                      {b.meetingLink ? (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:underline"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meeting</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-zinc-500 italic">Not set</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(b);
                            setMeetingLinkInput(b.meetingLink || '');
                          }}
                        >
                          Manage
                        </Button>
                        <button
                          onClick={() => setDeleteTarget(b)}
                          className="p-2 rounded-lg bg-rose-600/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
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

      {/* Manage Booking Modal */}
      {selectedBooking && (
        <Modal
          isOpen={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details: ${selectedBooking.name}`}
          subtitle={`Session scheduled for ${selectedBooking.date} at ${selectedBooking.timeSlot}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Email:</span>
                <span className="font-bold text-white">{selectedBooking.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Topic:</span>
                <span className="font-bold text-emerald-400">{selectedBooking.serviceName}</span>
              </div>
              {selectedBooking.notes && (
                <div className="pt-2 border-t border-zinc-800">
                  <span className="text-zinc-500 block mb-1">Client Notes:</span>
                  <p className="text-zinc-300 leading-relaxed">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Attribution Details */}
              {(selectedBooking.utmSource || selectedBooking.utmCampaign || selectedBooking.landingPage) && (
                <div className="p-3 rounded-lg bg-zinc-950 border border-teal-500/20 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    <span>Meta Ads / Campaign Attribution</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 pt-1">
                    <div>
                      <span className="text-zinc-500 block">Source:</span>
                      <span className="font-semibold text-white">{selectedBooking.utmSource || 'Direct / Organic'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Campaign:</span>
                      <span className="font-semibold text-white">{selectedBooking.utmCampaign || '—'}</span>
                    </div>
                    {selectedBooking.utmContent && (
                      <div>
                        <span className="text-zinc-500 block">Ad Content:</span>
                        <span className="font-semibold text-white">{selectedBooking.utmContent}</span>
                      </div>
                    )}
                    {selectedBooking.landingPage && (
                      <div>
                        <span className="text-zinc-500 block">Landing Page:</span>
                        <span className="font-mono text-zinc-400 truncate">{selectedBooking.landingPage}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Set Meeting Link Form */}
            <form onSubmit={handleSaveMeetingLink} className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-300">
                Google Meet / Zoom URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={meetingLinkInput}
                  onChange={(e) => setMeetingLinkInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                <Button type="submit" variant="primary" size="sm" isLoading={savingLink}>
                  Save Link
                </Button>
              </div>
            </form>

            {/* Status Transitions */}
            <div className="pt-4 border-t border-zinc-800 space-y-2">
              <span className="text-xs font-semibold text-zinc-400 block">Update Status:</span>
              <div className="flex flex-wrap gap-2">
                {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedBooking.id, st)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedBooking.status === st
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Booking"
        message={`Are you sure you want to delete the booking for "${deleteTarget?.name}"?`}
      />
    </div>
  );
};

export default AdminBookingsPage;
