import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Layout,
  Sparkles,
  Save,
  Layers,
  Award,
  CheckCircle2,
  ListOrdered,
  Eye,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminHomepageCmsPage = () => {
  const { success, error } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    // Trust / Social Proof
    trust_title: 'Trusted by High-Growth E-Commerce Brands & Tech Startups Worldwide',
    trust_stats_clients: '120+ Brands Scaled',
    trust_stats_roi: '3.8x Avg CTR Boost',
    trust_stats_rating: '5.0 Star Rating (45+ Reviews)',

    // Services Preview
    services_section_badge: 'Core Creative Capabilities',
    services_section_title: 'High-Impact Design Services Built for Conversion & Scale',
    services_section_subtitle: 'From memorable brand identities to high-converting ad creatives, explore our full spectrum of specialized design solutions.',

    // Featured Work Preview
    portfolio_section_badge: 'Selected Case Studies',
    portfolio_section_title: 'Proven Design Work That Drove Real Commercial Impact',
    portfolio_section_subtitle: 'Explore recent brand identities, high-converting social ad campaigns, packaging designs, and e-commerce visuals.',

    // About Preview
    about_section_badge: 'The Designer Behind The Work',
    about_section_title: 'Creative Graphic Designer with 3+ Years of High-Impact Experience',
    about_section_text: 'I partner with forward-thinking business owners, marketing directors, and e-commerce founders to turn creative ideas into revenue-driving visual assets.',

    // Why Choose Me
    why_title: 'Why Top Brands & Founders Choose to Work with Sakhawat',
    why_subtitle: 'Here is what sets our creative partnership apart from generic design agencies.',
    why_point1_title: 'Fast 24–48h Turnaround',
    why_point1_desc: 'Speed matters in marketing. Get production-ready ad creatives and assets in rapid turnaround windows.',
    why_point2_title: 'Sales & Conversion Focused',
    why_point2_desc: 'Every graphic is structured around marketing psychology, clear visual hierarchy, and proven conversion principles.',
    why_point3_title: 'Full Commercial & Source Rights',
    why_point3_desc: 'Receive organized, editable source files (Figma, AI, PSD) along with high-res exports ready for all platforms.',

    // 5-Step Process
    process_section_badge: 'Transparent Collaboration',
    process_section_title: 'Our Proven 5-Step Design Process',
    process_section_subtitle: 'From initial discovery to final source file delivery, experience a frictionless creative workflow.',

    // Final CTA Banner
    final_cta_badge: 'Ready to Level Up Your Brand?',
    final_cta_title: 'Let’s Build Visuals That Drive Sales & Elevate Your Brand',
    final_cta_subtitle: 'Have an upcoming campaign, brand launch, or ongoing design needs? Schedule a free 15-min discovery call or submit an inquiry.',
    final_cta_button_text: 'Book Free Discovery Call',
    final_cta_button_url: '/book-a-meeting',
  });

  useEffect(() => {
    fetchHomepageSettings();
  }, []);

  const fetchHomepageSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.success && res.data) {
        const d = res.data;
        setFormData((prev) => ({
          ...prev,
          trust_title: d.trust_title || prev.trust_title,
          trust_stats_clients: d.trust_stats_clients || prev.trust_stats_clients,
          trust_stats_roi: d.trust_stats_roi || prev.trust_stats_roi,
          trust_stats_rating: d.trust_stats_rating || prev.trust_stats_rating,
          services_section_badge: d.services_section_badge || prev.services_section_badge,
          services_section_title: d.services_section_title || prev.services_section_title,
          services_section_subtitle: d.services_section_subtitle || prev.services_section_subtitle,
          portfolio_section_badge: d.portfolio_section_badge || prev.portfolio_section_badge,
          portfolio_section_title: d.portfolio_section_title || prev.portfolio_section_title,
          portfolio_section_subtitle: d.portfolio_section_subtitle || prev.portfolio_section_subtitle,
          about_section_badge: d.about_section_badge || prev.about_section_badge,
          about_section_title: d.about_section_title || prev.about_section_title,
          about_section_text: d.about_section_text || prev.about_section_text,
          why_title: d.why_title || prev.why_title,
          why_subtitle: d.why_subtitle || prev.why_subtitle,
          why_point1_title: d.why_point1_title || prev.why_point1_title,
          why_point1_desc: d.why_point1_desc || prev.why_point1_desc,
          why_point2_title: d.why_point2_title || prev.why_point2_title,
          why_point2_desc: d.why_point2_desc || prev.why_point2_desc,
          why_point3_title: d.why_point3_title || prev.why_point3_title,
          why_point3_desc: d.why_point3_desc || prev.why_point3_desc,
          process_section_badge: d.process_section_badge || prev.process_section_badge,
          process_section_title: d.process_section_title || prev.process_section_title,
          process_section_subtitle: d.process_section_subtitle || prev.process_section_subtitle,
          final_cta_badge: d.final_cta_badge || prev.final_cta_badge,
          final_cta_title: d.final_cta_title || prev.final_cta_title,
          final_cta_subtitle: d.final_cta_subtitle || prev.final_cta_subtitle,
          final_cta_button_text: d.final_cta_button_text || prev.final_cta_button_text,
          final_cta_button_url: d.final_cta_button_url || prev.final_cta_button_url,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch homepage settings:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/settings/admin/bulk', { settings: formData });
      if (res.success) {
        success('Homepage section contents updated successfully!');
      } else {
        error(res.message || 'Failed to save homepage settings.');
      }
    } catch (err) {
      error(err.message || 'Error saving settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
              Homepage Sections CMS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold">
              Full Control
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Customize section titles, value propositions, process headlines, and call-to-action banners across the homepage.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Save}
          loading={saving}
          onClick={handleSave}
          className="shadow-lg shadow-teal-950/50 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save Homepage Sections'}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section: Services Preview Header */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Services Preview Section</h2>
              <p className="text-xs text-zinc-400">Headings for the homepage services showcase.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Badge / Pill Label
              </label>
              <input
                type="text"
                name="services_section_badge"
                value={formData.services_section_badge}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Section Heading (H2)
              </label>
              <input
                type="text"
                name="services_section_title"
                value={formData.services_section_title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Section Subtitle / Description
              </label>
              <textarea
                name="services_section_subtitle"
                rows={2}
                value={formData.services_section_subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section: Featured Portfolio Header */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Featured Portfolio Section</h2>
              <p className="text-xs text-zinc-400">Headings for the homepage selected case studies.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Section Badge
              </label>
              <input
                type="text"
                name="portfolio_section_badge"
                value={formData.portfolio_section_badge}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Section Title
              </label>
              <input
                type="text"
                name="portfolio_section_title"
                value={formData.portfolio_section_title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Section Subtitle
              </label>
              <textarea
                name="portfolio_section_subtitle"
                rows={2}
                value={formData.portfolio_section_subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section: Why Choose Me */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Why Choose Me Section</h2>
              <p className="text-xs text-zinc-400">3 Core value propositions highlighted on the homepage.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  name="why_title"
                  value={formData.why_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  name="why_subtitle"
                  value={formData.why_subtitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
                <span className="text-xs font-bold text-teal-400 uppercase">Point 1</span>
                <input
                  type="text"
                  name="why_point1_title"
                  value={formData.why_point1_title}
                  onChange={handleChange}
                  placeholder="Title"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-bold focus:border-teal-500 focus:outline-none"
                />
                <textarea
                  name="why_point1_desc"
                  rows={3}
                  value={formData.why_point1_desc}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
                <span className="text-xs font-bold text-teal-400 uppercase">Point 2</span>
                <input
                  type="text"
                  name="why_point2_title"
                  value={formData.why_point2_title}
                  onChange={handleChange}
                  placeholder="Title"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-bold focus:border-teal-500 focus:outline-none"
                />
                <textarea
                  name="why_point2_desc"
                  rows={3}
                  value={formData.why_point2_desc}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-3">
                <span className="text-xs font-bold text-teal-400 uppercase">Point 3</span>
                <input
                  type="text"
                  name="why_point3_title"
                  value={formData.why_point3_title}
                  onChange={handleChange}
                  placeholder="Title"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-xs font-bold focus:border-teal-500 focus:outline-none"
                />
                <textarea
                  name="why_point3_desc"
                  rows={3}
                  value={formData.why_point3_desc}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Final Conversion CTA Banner */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Final Conversion CTA Banner</h2>
              <p className="text-xs text-zinc-400">The high-impact conversion card at the bottom of the page.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                CTA Pill / Badge
              </label>
              <input
                type="text"
                name="final_cta_badge"
                value={formData.final_cta_badge}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                CTA Main Title
              </label>
              <input
                type="text"
                name="final_cta_title"
                value={formData.final_cta_title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                CTA Description
              </label>
              <textarea
                name="final_cta_subtitle"
                rows={2}
                value={formData.final_cta_subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  name="final_cta_button_text"
                  value={formData.final_cta_button_text}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Button Destination URL
                </label>
                <input
                  type="text"
                  name="final_cta_button_url"
                  value={formData.final_cta_button_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md sticky bottom-6 z-20">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Changes reflect immediately on the live homepage.</span>
          </div>

          <Button
            variant="primary"
            icon={Save}
            loading={saving}
            type="submit"
            className="cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save All Sections'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminHomepageCmsPage;
