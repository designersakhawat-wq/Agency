import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Send,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import tracking from '../../services/trackingService';
import { getAttributionData } from '../../utils/utmTracker';

const ContactPage = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: 'Logo & Branding',
    budget: '$500 - $1,500',
    projectType: 'New Brand Launch',
    deadline: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      error('Please complete Name, Email, and Message.');
      return;
    }

    setLoading(true);
    try {
      const attribution = getAttributionData();
      const payload = {
        ...formData,
        ...attribution,
      };

      const res = await api.post('/inquiries', payload);
      if (res.success) {
        setSubmitted(true);
        // Dispatch Meta Pixel Lead Conversion Event
        tracking.trackLead('Contact Page Inquiry Form', 0, 'USD', {
          service: formData.service,
          budget: formData.budget,
          project_type: formData.projectType,
        });
        success('Your inquiry has been delivered directly to Sakhawat!');
      } else {
        error(res.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      error(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-44 sm:pt-48 pb-24 min-h-screen relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="ambient-glow-teal top-20 left-1/4 opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Let's Collaborate
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight">
            Start Your Next Creative Project
          </h1>
          <p className="text-base sm:text-lg text-zinc-300">
            Have a project in mind, need ongoing agency design support, or want to discuss a custom campaign? Send your inquiry below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Contact Info & Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-3xl glass-card border border-zinc-800 space-y-6">
              <h3 className="text-xl font-bold font-display text-white">Direct Contact Channels</h3>

              <div className="space-y-4 text-xs">
                <a
                  href="mailto:designersakhawat@gmail.com"
                  onClick={() => tracking.trackEmailClick('designersakhawat@gmail.com', 'Contact Page')}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3.5 hover:border-teal-500/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Email Address</span>
                    <span className="text-white font-bold group-hover:text-teal-300 transition-colors">
                      designersakhawat@gmail.com
                    </span>
                  </div>
                </a>

                <a
                  href="tel:01781955355"
                  onClick={() => tracking.trackCallClick('01781955355', 'Contact Page')}
                  className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3.5 hover:border-teal-500/40 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 shrink-0 group-hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Direct Phone & WhatsApp</span>
                    <span className="text-white font-bold group-hover:text-teal-300 transition-colors">
                      01781955355
                    </span>
                  </div>
                </a>

                <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Studio Location</span>
                    <span className="text-white font-bold">
                      Ishurdi, Pabna, Rajshahi, Bangladesh
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Professional Profiles
                </span>
                <div className="flex gap-2.5">
                  <a
                    href="https://www.linkedin.com/in/designersakhawat/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-teal-500/40 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.behance.net/sakhawatdesigner"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-teal-500/40 transition-colors font-bold text-sm"
                    title="Behance"
                  >
                    Bē
                  </a>
                  <a
                    href="https://designersakhawat.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-teal-500/40 transition-colors"
                    title="Website"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Comprehensive Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl glass-card border border-zinc-800 relative">
              {submitted ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-white">Inquiry Delivered!</h3>
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                    Thanks for reaching out! Your project details have been recorded and sent to Sakhawat. You will receive a response within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        service: 'Logo & Branding',
                        budget: '$500 - $1,500',
                        projectType: 'New Brand Launch',
                        deadline: '',
                        message: '',
                      });
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Michael Scott"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. michael@dundermifflin.com"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +880 1781955355"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Company / Brand Name
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Dunder Mifflin Inc."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Service Category
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-teal-500"
                      >
                        <option value="Logo & Branding">Logo & Branding</option>
                        <option value="Ads Creative">Ads Creative</option>
                        <option value="UGC Video">UGC Video</option>
                        <option value="Cover Branding">Cover Branding</option>
                        <option value="E-commerce Product Design">E-commerce Product Design</option>
                        <option value="General Creative Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Estimated Budget
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-teal-500"
                      >
                        <option value="Under $500">Under $500</option>
                        <option value="$500 - $1,500">$500 - $1,500</option>
                        <option value="$1,500 - $3,000">$1,500 - $3,000</option>
                        <option value="$3,000+">$3,000+ (Retainer)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Target Deadline
                      </label>
                      <input
                        type="text"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        placeholder="e.g. Within 2 weeks"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Project Goals & Message *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about your brand, what deliverables you need, and your target campaign dates..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 transition-colors"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={Send}
                    iconPosition="right"
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
    </div>
  );
};

export default ContactPage;
