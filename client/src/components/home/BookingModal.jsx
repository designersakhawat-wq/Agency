import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Calendar, Clock, CheckCircle2, User, Mail, MessageSquare, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const timeSlots = [
  '09:30 AM',
  '11:00 AM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
];

const services = [
  'UI/UX & Product Design Consultation',
  'Design System Architecture & Audit',
  'Full-Stack Web / App Development',
  'Brand Identity & Visual Strategy',
  'General Project Discovery & Feasibility',
];

const BookingModal = ({ isOpen, onClose, defaultService = '' }) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceName: defaultService || services[0],
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow default
    timeSlot: timeSlots[0],
    notes: '',
  });
  const [busySlots, setBusySlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  useEffect(() => {
    if (defaultService) {
      setFormData((prev) => ({ ...prev, serviceName: defaultService }));
    }
  }, [defaultService]);

  // Fetch busy slots for selected date
  useEffect(() => {
    if (formData.date && isOpen) {
      api
        .get('/bookings/busy-slots', { date: formData.date })
        .then((res) => {
          if (res.success) setBusySlots(res.data || []);
        })
        .catch(() => {});
    }
  }, [formData.date, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.date || !formData.timeSlot) {
      error('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/bookings', formData);
      if (res.success) {
        setBookedSuccess(true);
        success('Discovery call booked successfully! Check your email for details.');
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      error(err.message || 'Failed to schedule booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setBookedSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={bookedSuccess ? '' : 'Schedule a Discovery Call'}
      subtitle={bookedSuccess ? '' : 'Select a date and time slot for a 30-minute consultation call.'}
      maxWidth="max-w-xl"
    >
      {bookedSuccess ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold font-display text-white">Call Scheduled!</h3>
          <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
            Thank you, <strong className="text-white">{formData.name}</strong>! Your session is booked for{' '}
            <strong className="text-indigo-400">{formData.date}</strong> at{' '}
            <strong className="text-indigo-400">{formData.timeSlot}</strong>.
          </p>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 max-w-sm mx-auto">
            A confirmation email has been dispatched with calendar invite details.
          </div>
          <div className="pt-4">
            <Button variant="primary" size="md" onClick={handleResetAndClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Select Discussion Topic
            </label>
            <select
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
            >
              {services.map((s, idx) => (
                <option key={idx} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Select Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                required
              />
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Select Time Slot
              </label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm"
                required
              >
                {timeSlots.map((slot, idx) => {
                  const isBusy = busySlots.includes(slot);
                  return (
                    <option key={idx} value={slot} disabled={isBusy}>
                      {slot} {isBusy ? '(Booked)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Your Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm placeholder:text-zinc-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                Work Email *
              </label>
              <input
                type="email"
                placeholder="sarah@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm placeholder:text-zinc-600"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              Project Context / Goals (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Tell me a bit about your product, timeline, or current challenges..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs sm:text-sm placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full"
            >
              Confirm 30-Min Call
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default BookingModal;
