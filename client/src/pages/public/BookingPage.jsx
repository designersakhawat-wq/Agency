import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  User,
  Mail,
  Building,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useCurrency } from '../../context/CurrencyContext';

const timeSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '08:00 PM',
  '09:30 PM',
];

const meetingTypes = [
  'Creative Discovery Consultation (30 min)',
  'Brand Strategy & Visual Direction (45 min)',
  'E-Commerce & Ads Campaign Audit (30 min)',
];

const BookingPage = () => {
  const location = useLocation();
  const { success, error } = useToast();
  const { formatAmount, currencySymbol } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [busySlots, setBusySlots] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const initialServiceName = location.state?.serviceName || 'Logo & Branding';
  const initialNotes = location.state?.packageName
    ? `Interested in package: ${location.state.packageName} (${formatAmount(location.state.packagePrice || 0)})`
    : '';

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceName: initialServiceName,
    meetingType: 'Creative Discovery Consultation (30 min)',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '11:00 AM',
    budget: location.state?.packagePrice ? `${formatAmount(location.state.packagePrice)}` : 'Growth',
    notes: initialNotes,
  });

  useEffect(() => {
    if (formData.date) {
      api.get(`/bookings/busy-slots?date=${formData.date}`).then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setBusySlots(res.data);
        }
      }).catch(() => {});
    }
  }, [formData.date]);

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
        setBookingSuccess(true);
        success('Discovery consultation reserved successfully!');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#14b8a6', '#0d9488', '#2dd4bf', '#ffffff'],
        });
      } else {
        error(res.message || 'Failed to book slot.');
      }
    } catch (err) {
      error(err.message || 'Time slot already taken or booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-44 sm:pt-48 pb-24 min-h-screen relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow-teal top-20 right-1/4 opacity-20 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            1-on-1 Creative Consultation
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight">
            Book a Discovery Session
          </h1>
          <p className="text-base text-zinc-300">
            Schedule a focused video consultation with Md Sakhawat Hossain to discuss your brand identity, advertising campaigns, or custom video deliverables.
          </p>
        </div>

        {/* Value Points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl glass-card border border-zinc-800 space-y-2">
            <Clock className="w-6 h-6 text-teal-400" />
            <h4 className="font-bold text-white text-base">30-45 Minutes</h4>
            <p className="text-xs text-zinc-400">High-efficiency creative strategy call focused on your exact goals.</p>
          </div>
          <div className="p-6 rounded-2xl glass-card border border-zinc-800 space-y-2">
            <Video className="w-6 h-6 text-teal-400" />
            <h4 className="font-bold text-white text-base">Google Meet / Zoom</h4>
            <p className="text-xs text-zinc-400">Direct calendar invite and video link assigned upon confirmation.</p>
          </div>
          <div className="p-6 rounded-2xl glass-card border border-zinc-800 space-y-2">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
            <h4 className="font-bold text-white text-base">Transparent Scoping</h4>
            <p className="text-xs text-zinc-400">Get clear pricing estimates, turnaround timelines, and actionable feedback.</p>
          </div>
        </div>

        {/* Scheduler Form */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-zinc-800 relative">
          {bookingSuccess ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-display text-white">Consultation Reserved!</h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-white">{formData.name}</strong>. Your meeting has been scheduled for{' '}
                <strong className="text-teal-400">{formData.date} at {formData.timeSlot}</strong>. Sakhawat will send a confirmation and video link to your email.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBookingSuccess(false);
                    setFormData((prev) => ({
                      ...prev,
                      name: '',
                      email: '',
                      phone: '',
                      company: '',
                      notes: '',
                    }));
                  }}
                >
                  Schedule Another Session
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Meeting Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  1. Select Meeting Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {meetingTypes.map((type, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormData({ ...formData, meetingType: type })}
                      className={`p-3.5 rounded-xl border text-xs text-left transition-all ${
                        formData.meetingType === type
                          ? 'bg-teal-500/10 border-teal-500 text-white font-bold shadow-md'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    2. Pick a Date *
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-2">
                    3. Select Time Slot *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timeSlots.map((slot) => {
                      const isBusy = busySlots.includes(slot);
                      const isSelected = formData.timeSlot === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          disabled={isBusy}
                          onClick={() => setFormData({ ...formData, timeSlot: slot })}
                          className={`p-2 rounded-xl text-xs font-medium border text-center transition-all ${
                            isBusy
                              ? 'bg-zinc-950 border-zinc-900 text-zinc-600 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-teal-600 text-white border-teal-500 font-bold shadow-md shadow-teal-950/40'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="pt-2 border-t border-zinc-800 space-y-4">
                <span className="text-xs font-semibold text-zinc-300 block">
                  4. Your Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Your Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="e.g. john@brand.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Company / Brand</label>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Estimated Budget</label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
                    >
                      <option value="Under Tier">Under {formatAmount(500)}</option>
                      <option value="Standard Tier">{formatAmount(500)} – {formatAmount(1500)}</option>
                      <option value="Growth Tier">{formatAmount(1500)} – {formatAmount(3000)}</option>
                      <option value="Scale Tier">{formatAmount(3000)}+ (Retainer)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Project Notes & Topics to Discuss
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe what you would like to cover during our call..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={CalendarIcon}
                isLoading={loading}
                className="w-full"
              >
                Confirm & Schedule Discovery Call
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
