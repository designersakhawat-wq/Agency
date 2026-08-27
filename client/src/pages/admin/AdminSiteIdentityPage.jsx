import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Sparkles,
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Linkedin,
  Share2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminSiteIdentityPage = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    designer_name: 'Md Sakhawat Hossain',
    designer_title: 'Creative Graphic Designer',
    designer_short_title: 'Creative Designer',
    hero_title: 'Creative Graphic Designer Helping Brands Stand Out, Sell Better, and Look Professional.',
    hero_subtitle: 'Specializing in high-converting advertising creatives, memorable brand identities, e-commerce product design, and dynamic UGC video content.',
    designer_bio: 'Helping brands and e-commerce companies stand out, sell better, and look world-class through high-converting advertising creatives, distinct brand identities, and dynamic video content.',
    availability_status: 'Immediately Available for Remote Projects',
    hero_badge: 'Available for Remote Creative Contracts',
    primary_cta_text: 'Book a Meeting',
    primary_cta_url: '/book-a-meeting',
    secondary_cta_text: 'View Portfolio',
    secondary_cta_url: '/portfolio',
    hero_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    about_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    contact_location: 'Ishurdi, Pabna, Rajshahi, Bangladesh',
    contact_email: 'designersakhawat@gmail.com',
    contact_phone: '01781955355',
    years_experience: '3+',
    projects_completed_count: '150+',
    satisfaction_rate: '99%',
    social_linkedin: 'https://www.linkedin.com/in/designersakhawat/',
    social_behance: 'https://www.behance.net/sakhawatdesigner',
    social_facebook: 'https://facebook.com/designersakhawat',
    social_instagram: 'https://instagram.com/designersakhawat',
    social_website: 'https://designersakhawat.com/',
  });

  useEffect(() => {
    fetchIdentitySettings();
  }, []);

  const fetchIdentitySettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.success && res.data) {
        const d = res.data;
        let socialLinks = {};
        if (d.social_links) {
          try {
            socialLinks = typeof d.social_links === 'string' ? JSON.parse(d.social_links) : d.social_links;
          } catch (e) {}
        }

        setFormData((prev) => ({
          ...prev,
          designer_name: d.designer_name || d.hero_designer_name || prev.designer_name,
          designer_title: d.designer_title || d.hero_designer_title || prev.designer_title,
          designer_short_title: d.designer_short_title || prev.designer_short_title,
          hero_title: d.hero_title || prev.hero_title,
          hero_subtitle: d.hero_subtitle || prev.hero_subtitle,
          designer_bio: d.designer_bio || prev.designer_bio,
          availability_status: d.availability_status || prev.availability_status,
          hero_badge: d.hero_badge || prev.hero_badge,
          primary_cta_text: d.primary_cta_text || prev.primary_cta_text,
          primary_cta_url: d.primary_cta_url || prev.primary_cta_url,
          secondary_cta_text: d.secondary_cta_text || prev.secondary_cta_text,
          secondary_cta_url: d.secondary_cta_url || prev.secondary_cta_url,
          hero_image: d.hero_image || prev.hero_image,
          about_image: d.about_image || prev.about_image,
          contact_location: d.contact_location || prev.contact_location,
          contact_email: d.contact_email || prev.contact_email,
          contact_phone: d.contact_phone || prev.contact_phone,
          years_experience: d.years_experience || prev.years_experience,
          projects_completed_count: d.projects_completed_count || prev.projects_completed_count,
          satisfaction_rate: d.satisfaction_rate || prev.satisfaction_rate,
          social_linkedin: socialLinks.linkedin || prev.social_linkedin,
          social_behance: socialLinks.behance || prev.social_behance,
          social_facebook: socialLinks.facebook || prev.social_facebook,
          social_instagram: socialLinks.instagram || prev.social_instagram,
          social_website: socialLinks.website || prev.social_website,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch site identity settings:', err);
    } finally {
      setLoading(false);
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
      const payload = {
        ...formData,
        social_links: JSON.stringify({
          linkedin: formData.social_linkedin,
          behance: formData.social_behance,
          facebook: formData.social_facebook,
          instagram: formData.social_instagram,
          website: formData.social_website,
        }),
      };

      const res = await api.post('/settings/admin/bulk', { settings: payload });
      if (res.success) {
        success('Site identity & positioning saved! Live website updated instantly.');
        // Update local cache
        localStorage.setItem('sakhawat_cached_settings', JSON.stringify(payload));
      } else {
        error(res.message || 'Failed to save settings.');
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
              Site Identity & Positioning
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold">
              Dynamic CMS
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1">
            Manually customize your professional title, headlines, bio, availability, and brand positioning. Updates appear on the live site in real-time.
          </p>
        </div>

        <Button
          variant="primary"
          icon={Save}
          loading={saving}
          onClick={handleSave}
          className="shadow-lg shadow-teal-950/50 cursor-pointer"
        >
          {saving ? 'Saving Live...' : 'Save Positioning'}
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Professional Identity */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Professional Role & Title</h2>
              <p className="text-xs text-zinc-400">
                Define your primary positioning (e.g. Creative Graphic Designer) without code changes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="designer_name"
                value={formData.designer_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="Md Sakhawat Hossain"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Primary Professional Title
              </label>
              <input
                type="text"
                name="designer_title"
                value={formData.designer_title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="Creative Graphic Designer"
                required
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Displayed in Hero, About, Navbars, Footers, and Meta Titles.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Short Title (Navbar & Badges)
              </label>
              <input
                type="text"
                name="designer_short_title"
                value={formData.designer_short_title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="Creative Designer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Availability Status Badge
              </label>
              <input
                type="text"
                name="availability_status"
                value={formData.availability_status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="Immediately Available for Remote Projects"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Hero Headlines & Value Proposition */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hero Headlines & CTAs</h2>
              <p className="text-xs text-zinc-400">
                The main headlines and call-to-action buttons visitors see immediately upon landing.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Hero Badge / Pill Text
              </label>
              <input
                type="text"
                name="hero_badge"
                value={formData.hero_badge}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="Available for Remote Creative Contracts"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Hero Main Headline (H1)
              </label>
              <textarea
                name="hero_title"
                rows={2}
                value={formData.hero_title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="Creative Graphic Designer Helping Brands Stand Out, Sell Better, and Look Professional."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Hero Subheadline / Supporting Pitch
              </label>
              <textarea
                name="hero_subtitle"
                rows={3}
                value={formData.hero_subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="Specializing in high-converting advertising creatives, memorable brand identities, e-commerce product design, and dynamic UGC video content."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Primary CTA Button Label & Link
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="primary_cta_text"
                    value={formData.primary_cta_text}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                    placeholder="Book a Meeting"
                  />
                  <input
                    type="text"
                    name="primary_cta_url"
                    value={formData.primary_cta_url}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                    placeholder="/book-a-meeting"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Secondary CTA Button Label & Link
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="secondary_cta_text"
                    value={formData.secondary_cta_text}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                    placeholder="View Portfolio"
                  />
                  <input
                    type="text"
                    name="secondary_cta_url"
                    value={formData.secondary_cta_url}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                    placeholder="/portfolio"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Profile Images & Bio */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Bio & Profile Imagery</h2>
              <p className="text-xs text-zinc-400">
                Professional portrait URL and long-form bio for the About section.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Hero Profile Image URL
              </label>
              <input
                type="text"
                name="hero_image"
                value={formData.hero_image}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="https://..."
              />
              {formData.hero_image && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                  <img
                    src={formData.hero_image}
                    alt="Hero Preview"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="text-xs text-zinc-400">Hero image preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                About Page Image URL
              </label>
              <input
                type="text"
                name="about_image"
                value={formData.about_image}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="https://..."
              />
              {formData.about_image && (
                <div className="mt-3 flex items-center gap-3 p-2 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                  <img
                    src={formData.about_image}
                    alt="About Preview"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="text-xs text-zinc-400">About page portrait preview</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Professional Bio / Summary
              </label>
              <textarea
                name="designer_bio"
                rows={3}
                value={formData.designer_bio}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="Helping brands and e-commerce companies stand out, sell better..."
              />
            </div>
          </div>
        </div>

        {/* Section 4: Contact & Social Channels */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Contact & Social Channels</h2>
              <p className="text-xs text-zinc-400">
                Official contact details and verified social profiles shown across the site.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="designersakhawat@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Phone / WhatsApp Number
              </label>
              <input
                type="text"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="01781955355"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Location
              </label>
              <input
                type="text"
                name="contact_location"
                value={formData.contact_location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="Ishurdi, Pabna, Bangladesh"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                LinkedIn Profile URL
              </label>
              <input
                type="text"
                name="social_linkedin"
                value={formData.social_linkedin}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Behance Portfolio URL
              </label>
              <input
                type="text"
                name="social_behance"
                value={formData.social_behance}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="https://behance.net/..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Official Website URL
              </label>
              <input
                type="text"
                name="social_website"
                value={formData.social_website}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="https://designersakhawat.com/"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md sticky bottom-6 z-20">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>All modifications save directly to the SQLite database without build requirements.</span>
          </div>

          <Button
            variant="primary"
            icon={Save}
            loading={saving}
            type="submit"
            className="cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSiteIdentityPage;
