import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Plus,
  Trash2,
  Sparkles,
  User,
  ShieldCheck,
  Briefcase,
  Wrench,
  Layers,
  ArrowRight,
  Upload,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Calendar,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

const DEFAULT_PHILOSOPHY = [
  {
    icon: 'Target',
    title: 'Marketing & ROI Focused',
    desc: 'Every color, headline hierarchy, and visual hook is engineered with consumer psychology to stop the scroll and maximize ROAS.',
  },
  {
    icon: 'FileCheck',
    title: 'Master Layered Source Files',
    desc: 'You receive 100% organized, named vector .AI, .EPS, and layered Figma / PSD files ready for infinite commercial scaling.',
  },
  {
    icon: 'Clock',
    title: 'Reliable 24–48h Turnaround',
    desc: 'Strict adherence to project deadlines, rapid drafting, and proactive communication via WhatsApp and Google Meet.',
  },
  {
    icon: 'HeartHandshake',
    title: 'Full Commercial Release',
    desc: 'Complete intellectual property rights and commercial license handover upon project approval with zero hidden royalties.',
  },
];

const DEFAULT_EXPERIENCES = [
  {
    company: 'e-Learn IT Institute',
    role: 'Senior Ruffles Designer & Creative Lead',
    period: 'Recent / Current',
    location: 'Bangladesh (Remote)',
    desc: 'Directing marketing creative campaigns, high-converting course enrollment banners, team design standards, and digital promotional branding.',
    tags: ['Creative Direction', 'Campaign Design', 'Team Mentorship'],
  },
  {
    company: 'Optiva Max',
    role: 'Senior Graphic Designer',
    period: 'Previous',
    location: 'Dubai, UAE (Remote)',
    desc: 'Engineered high-converting e-commerce product visual packaging, digital store branding, and sales-focused social media advertising assets.',
    tags: ['E-Commerce', 'Product Branding', 'Direct Response'],
  },
  {
    company: 'ORA Organic',
    role: 'Senior Graphic & Visual Designer',
    period: 'Previous',
    location: 'Dubai, UAE',
    desc: 'Crafted premium wellness product visual framing and Meta ad creatives resulting in a documented +42% ROAS increase for paid campaigns.',
    tags: ['Wellness Brand', 'Meta Ads', '+42% ROAS'],
  },
  {
    company: 'Advanced Digital Automotive',
    role: 'Independent Designer & AI Video Editor',
    period: 'Previous',
    location: 'United States (Remote)',
    desc: 'Produced high-CTR YouTube thumbnails, print brand collateral, brand identity guidelines, and dynamic short-form AI video edits.',
    tags: ['USA Client', 'YouTube Branding', 'Motion Reels'],
  },
  {
    company: 'Kenakata Shop',
    role: 'Graphic Designer',
    period: 'Previous',
    location: 'Bangladesh',
    desc: 'Developed gadget and lifestyle e-commerce promotional creatives, packaging badge overlays, and social media marketing assets.',
    tags: ['E-Commerce', 'Gadget Branding', 'Social Media'],
  },
];

const DEFAULT_TOOLCHAIN = [
  {
    name: 'Adobe Photoshop',
    category: 'High-End Photo Manipulation & Retouching',
    level: '98%',
    iconType: 'photoshop',
  },
  {
    name: 'Adobe Illustrator',
    category: 'Precision Vector Logos & Brand Identity',
    level: '95%',
    iconType: 'illustrator',
  },
  {
    name: 'Adobe Premiere Pro',
    category: 'Commercial Video Pacing & Cut Editing',
    level: '90%',
    iconType: 'premiere',
  },
  {
    name: 'Adobe After Effects',
    category: 'Motion Graphics, Titles & Kinetic VFX',
    level: '85%',
    iconType: 'aftereffects',
  },
  {
    name: 'Figma',
    category: 'UI Design Systems, Mockups & Web Assets',
    level: '92%',
    iconType: 'figma',
  },
  {
    name: 'CapCut Pro',
    category: 'Dynamic 9:16 Vertical Reels & Burned-In Captions',
    level: '96%',
    iconType: 'capcut',
  },
];

export const AdminAboutCmsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  // Form State
  const [heroBadge, setHeroBadge] = useState('Senior Creative Partner');
  const [heroHeading, setHeroHeading] = useState('Visual Creatives Built for Authority & High ROAS');
  const [heroTagline, setHeroTagline] = useState('');
  const [bio1, setBio1] = useState(
    'I partner with forward-thinking e-commerce brands, digital agencies, and creators across Bangladesh, Dubai, and the USA to craft high-converting visual identities, ad creatives, and dynamic video reels.'
  );
  const [bio2, setBio2] = useState(
    'My design philosophy merges consumer psychology with pixel-perfect craftsmanship. Whether you need a memorable brand identity from scratch or high-CTR ad creative variations to scale paid campaigns, I deliver assets engineered for measurable growth.'
  );
  const [aboutImage, setAboutImage] = useState('');
  const [yearsExp, setYearsExp] = useState('3+');
  const [projectsCount, setProjectsCount] = useState('150+');
  const [clientRating, setClientRating] = useState('5.0 ★');
  const [locationStr, setLocationStr] = useState('Ishurdi, Pabna, Bangladesh (Working Worldwide)');
  const [languagesStr, setLanguagesStr] = useState('Bangla & English');
  const [availabilityStr, setAvailabilityStr] = useState('Available for Projects');

  // Philosophy Pillars
  const [philosophyPillars, setPhilosophyPillars] = useState(DEFAULT_PHILOSOPHY);

  // Experience History
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);

  // Toolchain
  const [toolchain, setToolchain] = useState(DEFAULT_TOOLCHAIN);

  // Bottom CTA
  const [ctaHeading, setCtaHeading] = useState('Ready to Upgrade Your Visual Brand?');
  const [ctaSubtitle, setCtaSubtitle] = useState(
    'Available immediately for commercial design projects, monthly brand retainers, and performance marketing asset creation.'
  );

  useEffect(() => {
    fetchAboutSettings();
  }, []);

  const fetchAboutSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.success && res.data) {
        const d = res.data;
        if (d.about_hero_badge) setHeroBadge(d.about_hero_badge);
        if (d.about_hero_heading) setHeroHeading(d.about_hero_heading);
        if (d.about_hero_tagline) setHeroTagline(d.about_hero_tagline);
        if (d.about_bio_1) setBio1(d.about_bio_1);
        if (d.about_bio_2) setBio2(d.about_bio_2);
        if (d.about_image) setAboutImage(d.about_image);
        if (d.about_years_exp) setYearsExp(d.about_years_exp);
        if (d.about_projects_count) setProjectsCount(d.about_projects_count);
        if (d.about_client_rating) setClientRating(d.about_client_rating);
        if (d.about_location_str) setLocationStr(d.about_location_str);
        if (d.about_languages_str) setLanguagesStr(d.about_languages_str);
        if (d.about_availability_str) setAvailabilityStr(d.about_availability_str);
        if (d.about_cta_heading) setCtaHeading(d.about_cta_heading);
        if (d.about_cta_subtitle) setCtaSubtitle(d.about_cta_subtitle);

        if (Array.isArray(d.about_philosophy_pillars)) {
          setPhilosophyPillars(d.about_philosophy_pillars);
        }
        if (Array.isArray(d.about_experiences)) {
          setExperiences(d.about_experiences);
        }
        if (Array.isArray(d.about_toolchain)) {
          setToolchain(d.about_toolchain);
        }
      }
    } catch (err) {
      addToast('Failed to load about page settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const payload = {
        about_hero_badge: heroBadge,
        about_hero_heading: heroHeading,
        about_hero_tagline: heroTagline,
        about_bio_1: bio1,
        about_bio_2: bio2,
        about_image: aboutImage,
        about_years_exp: yearsExp,
        about_projects_count: projectsCount,
        about_client_rating: clientRating,
        about_location_str: locationStr,
        about_languages_str: languagesStr,
        about_availability_str: availabilityStr,
        about_philosophy_pillars: philosophyPillars,
        about_experiences: experiences,
        about_toolchain: toolchain,
        about_cta_heading: ctaHeading,
        about_cta_subtitle: ctaSubtitle,
      };

      const res = await api.post('/admin/settings/bulk', { settings: payload });
      if (res.success) {
        addToast('About Page settings updated successfully!', 'success');
        // Clear cached settings
        localStorage.removeItem('sakhawat_cached_settings');
      } else {
        addToast(res.message || 'Failed to save settings', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Pillar Helpers
  const addPillar = () => {
    setPhilosophyPillars([
      ...philosophyPillars,
      {
        icon: 'ShieldCheck',
        title: 'New Value Proposition',
        desc: 'Describe why clients should trust you for this aspect of design work.',
      },
    ]);
  };

  const updatePillar = (idx, field, val) => {
    const updated = [...philosophyPillars];
    updated[idx][field] = val;
    setPhilosophyPillars(updated);
  };

  const removePillar = (idx) => {
    setPhilosophyPillars(philosophyPillars.filter((_, i) => i !== idx));
  };

  // Experience Helpers
  const addExperience = () => {
    setExperiences([
      {
        company: 'Agency / Brand Name',
        role: 'Senior Graphic Designer',
        period: '2023 - Present',
        location: 'Remote / City',
        desc: 'Describe key deliverables, campaign results, and design leadership contributions.',
        tags: ['Brand Design', 'Meta Ads'],
      },
      ...experiences,
    ]);
  };

  const updateExperience = (idx, field, val) => {
    const updated = [...experiences];
    updated[idx][field] = val;
    setExperiences(updated);
  };

  const updateExperienceTags = (idx, tagString) => {
    const updated = [...experiences];
    updated[idx].tags = tagString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setExperiences(updated);
  };

  const removeExperience = (idx) => {
    setExperiences(experiences.filter((_, i) => i !== idx));
  };

  // Toolchain Helpers
  const addTool = () => {
    setToolchain([
      ...toolchain,
      {
        name: 'Software Name',
        category: 'Core Use Case / Discipline',
        level: '90%',
        iconType: 'photoshop',
      },
    ]);
  };

  const updateTool = (idx, field, val) => {
    const updated = [...toolchain];
    updated[idx][field] = val;
    setToolchain(updated);
  };

  const removeTool = (idx) => {
    setToolchain(toolchain.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            <span>Visual Biography & Career CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            About Page Manager
          </h1>
          <p className="text-xs text-zinc-400">
            Edit your executive bio, photo, trust metrics, work history, and software toolstack in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/about"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold hover:text-white flex items-center gap-2 transition-colors"
          >
            <span>Live Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSaveAll}
            disabled={saving}
            className="font-black px-6 shadow-lg shadow-teal-950/40"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'hero'
              ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          1. Profile & Bio Hero
        </button>
        <button
          onClick={() => setActiveTab('pillars')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pillars'
              ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          2. Philosophy Pillars ({philosophyPillars.length})
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'experience'
              ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          3. Work Experience ({experiences.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tools'
              ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          4. Software Tools ({toolchain.length})
        </button>
        <button
          onClick={() => setActiveTab('cta')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cta'
              ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          5. Bottom CTA Banner
        </button>
      </div>

      {/* =========================================================================
          TAB 1: HERO & BIO PROFILE
          ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-teal-400" />
              <span>Bio & Headline Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Hero Badge</label>
                <input
                  type="text"
                  value={heroBadge}
                  onChange={(e) => setHeroBadge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  placeholder="e.g. Senior Creative Partner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Profile Image URL</label>
                <input
                  type="text"
                  value={aboutImage}
                  onChange={(e) => setAboutImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  placeholder="https://... (Direct image link)"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Main Headline</label>
                <input
                  type="text"
                  value={heroHeading}
                  onChange={(e) => setHeroHeading(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  placeholder="e.g. Visual Creatives Built for Authority & High ROAS"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Primary Bio Story (Paragraph 1)</label>
                <textarea
                  rows={3}
                  value={bio1}
                  onChange={(e) => setBio1(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none leading-relaxed"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Secondary Bio Philosophy (Paragraph 2)</label>
                <textarea
                  rows={3}
                  value={bio2}
                  onChange={(e) => setBio2(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics & Meta info */}
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <span>Trust Metrics & Badges</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Years Experience</label>
                <input
                  type="text"
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  placeholder="e.g. 3+"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Delivered Deliverables</label>
                <input
                  type="text"
                  value={projectsCount}
                  onChange={(e) => setProjectsCount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  placeholder="e.g. 150+"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Client Rating</label>
                <input
                  type="text"
                  value={clientRating}
                  onChange={(e) => setClientRating(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  placeholder="e.g. 5.0 ★"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Availability Tag</label>
                <input
                  type="text"
                  value={availabilityStr}
                  onChange={(e) => setAvailabilityStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  placeholder="e.g. Available for Projects"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Location Label</label>
                <input
                  type="text"
                  value={locationStr}
                  onChange={(e) => setLocationStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Languages Spoken</label>
                <input
                  type="text"
                  value={languagesStr}
                  onChange={(e) => setLanguagesStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PHILOSOPHY PILLARS
          ========================================================================= */}
      {activeTab === 'pillars' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Why Brands Partner With Sakhawat</h3>
              <p className="text-xs text-zinc-400">
                Key value propositions that build instant trust with agency directors and business owners.
              </p>
            </div>

            <Button variant="secondary" size="sm" icon={Plus} onClick={addPillar}>
              Add Pillar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {philosophyPillars.map((p, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal-400">
                    Pillar #{idx + 1}
                  </span>
                  <button
                    onClick={() => removePillar(idx)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Pillar Title</label>
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => updatePillar(idx, 'title', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Description</label>
                  <textarea
                    rows={2}
                    value={p.desc}
                    onChange={(e) => updatePillar(idx, 'desc', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: WORK EXPERIENCE HISTORY
          ========================================================================= */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Career History & Agency Roles</h3>
              <p className="text-xs text-zinc-400">
                Showcase your real-world contributions and verified agency track record.
              </p>
            </div>

            <Button variant="secondary" size="sm" icon={Plus} onClick={addExperience}>
              Add Experience
            </Button>
          </div>

          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 space-y-4 relative group"
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-white">{exp.company || 'New Role'}</span>
                  </div>

                  <button
                    onClick={() => removeExperience(idx)}
                    className="px-3 py-1 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Role</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Company / Brand</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Design Role / Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Time Period</label>
                    <input
                      type="text"
                      value={exp.period}
                      onChange={(e) => updateExperience(idx, 'period', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                      placeholder="e.g. Recent / Current"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Location / Mode</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                      placeholder="e.g. Dubai (Remote)"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">
                      Skills / Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(exp.tags) ? exp.tags.join(', ') : exp.tags || ''}
                      onChange={(e) => updateExperienceTags(idx, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                      placeholder="e.g. Creative Direction, Meta Ads, +42% ROAS"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Contributions & Key Responsibilities</label>
                    <textarea
                      rows={2}
                      value={exp.desc}
                      onChange={(e) => updateExperience(idx, 'desc', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SOFTWARE TOOLS & TOOLCHAIN
          ========================================================================= */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Software Stack & Toolchain</h3>
              <p className="text-xs text-zinc-400">
                Industry-standard software mastery levels displayed with authentic brand logos.
              </p>
            </div>

            <Button variant="secondary" size="sm" icon={Plus} onClick={addTool}>
              Add Software
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolchain.map((tool, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-teal-400">
                    Tool #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeTool(idx)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Software Name</label>
                  <input
                    type="text"
                    value={tool.name}
                    onChange={(e) => updateTool(idx, 'name', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Specialty / Discipline</label>
                  <input
                    type="text"
                    value={tool.category}
                    onChange={(e) => updateTool(idx, 'category', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Proficiency</label>
                    <input
                      type="text"
                      value={tool.level}
                      onChange={(e) => updateTool(idx, 'level', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                      placeholder="e.g. 95%"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Icon Logo</label>
                    <select
                      value={tool.iconType || 'photoshop'}
                      onChange={(e) => updateTool(idx, 'iconType', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                    >
                      <option value="photoshop">Photoshop (Ps)</option>
                      <option value="illustrator">Illustrator (Ai)</option>
                      <option value="premiere">Premiere Pro (Pr)</option>
                      <option value="aftereffects">After Effects (Ae)</option>
                      <option value="figma">Figma</option>
                      <option value="capcut">CapCut</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: BOTTOM CTA
          ========================================================================= */}
      {activeTab === 'cta' && (
        <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span>Bottom Conversion CTA Banner</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">CTA Heading</label>
              <input
                type="text"
                value={ctaHeading}
                onChange={(e) => setCtaHeading(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">CTA Subtitle</label>
              <textarea
                rows={3}
                value={ctaSubtitle}
                onChange={(e) => setCtaSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Save Button */}
      <div className="fixed bottom-6 right-8 z-30">
        <Button
          variant="primary"
          size="lg"
          icon={Save}
          onClick={handleSaveAll}
          disabled={saving}
          className="shadow-2xl shadow-teal-500/40 px-8 font-black"
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
};

export default AdminAboutCmsPage;
