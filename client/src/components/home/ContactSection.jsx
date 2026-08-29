import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export const ContactSection = ({ settings = {} }) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    service: 'UI/UX Design',
    budget: '$2,500 - $5,000',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const finalBadge = settings.final_cta_badge || "Let's Build Something Great";
  const finalTitle =
    settings.final_cta_title || 'Have an Idea or Need a Design Lead?';
  const finalSubtitle =
    settings.final_cta_subtitle ||
    "Whether you're launching a new venture, revamping an established brand, or creating high-converting marketing assets — I'm here to bring your vision to life.";
  const contactEmail = settings.contact_email || settings.email || 'designersakhawat@gmail.com';
  const contactLocation = settings.contact_location || settings.location || 'Rajshahi, Bangladesh • Worldwide Remote';

  const budgetRanges = [
    '< $2,500',
    '$2,500 - $5,000',
    '$5,000 - $10,000',
    '$10,000+',
    'Hourly / Retainer',
  ];

  const servicesList = [
    'UI/UX Design',
    'Design System Architecture',
    'Full-Stack Web App',
    'Mobile Application',
    'Brand Identity',
    'Other / Advisory',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      error('Please complete your name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/inquiries', formData);
      if (res.success) {
        setSubmitted(true);
        success(`Inquiry received! Notification sent to ${contactEmail}.`);
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      error(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-section" className="py-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="ambient-glow-indigo bottom-0 right-1/4 opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context & Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {finalBadge}
              </div>
              <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
                {finalTitle}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
                {finalSubtitle}
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-4">
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-4 p-4 rounded-2xl glass-card border border-zinc-800 hover:border-indigo-500/40 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-zinc-400 block">Direct Email</span>
                  <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate block">
                    {contactEmail}
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
              </a>

              <div className="flex items-center gap-4 p-4 rounded-2xl glass-card border border-zinc-800">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-zinc-400 block">Location & Availability</span>
                  <span className="text-sm font-bold text-white block">
                    {contactLocation}
                  </span>
                </div>
              </div>
            </div>

            {/* Response Time Notice */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span>Typical turnaround response time: <strong>under 24 hours</strong>.</span>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-zinc-800 shadow-2xl">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-white">Message Dispatched!</h3>
                  <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-white">{formData.name}</strong>. Your message has been routed to{' '}
                    <strong className="text-indigo-400">designersakhawat@gmail.com</strong>. I will review your project brief and follow up promptly.
                  </p>
                  <div className="pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: '',
                          email: '',
                          phone: '',
                          subject: '',
                          service: 'UI/UX Design',
                          budget: '$2,500 - $5,000',
                          message: '',
                        });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-xl font-bold font-display text-white mb-2">
                    Start a Conversation
                  </h3>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Alexander Wright"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm placeholder:text-zinc-600 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        placeholder="alexander@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm placeholder:text-zinc-600 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm placeholder:text-zinc-600 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Project Subject
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Fintech SaaS Redesign"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm placeholder:text-zinc-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Service & Budget Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Interested Service
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                      >
                        {servicesList.map((s, idx) => (
                          <option key={idx} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Estimated Budget
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                      >
                        {budgetRanges.map((b, idx) => (
                          <option key={idx} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Tell me about your project & requirements *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe your product vision, timeline, target audience, and any links or specs..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-sm placeholder:text-zinc-600 transition-colors resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Send}
                    isLoading={loading}
                    className="w-full"
                  >
                    Send Project Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
