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
  Star,
  Check,
  X,
  Plus,
  Search,
  Filter,
  Loader2,
  FolderKanban,
  Image as ImageIcon,
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

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectFilter, setProjectFilter] = useState('all'); // 'all' | 'featured' | 'hidden'
  const [projectCategory, setProjectCategory] = useState('All');
  const [projectSearch, setProjectSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchHomepageSettings();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const res = await api.get('/projects/admin/all');
      if (res.success && Array.isArray(res.data)) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects for homepage manager:', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleToggleFeatured = async (project) => {
    const newFeatured = !project.featured;
    setTogglingId(project.id);
    try {
      const res = await api.put(`/projects/${project.id}`, { featured: newFeatured });
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, featured: newFeatured } : p))
        );
        success(newFeatured ? `Added "${project.title}" to Homepage 3D Carousel!` : `Removed "${project.title}" from Homepage 3D Carousel.`);
      } else {
        error(res.message || 'Failed to update project status.');
      }
    } catch (err) {
      error(err.message || 'Error updating project.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleBulkToggle = async (shouldFeature) => {
    const targetProjects = filteredProjectsList;
    if (targetProjects.length === 0) return;
    setProjectsLoading(true);
    try {
      await Promise.all(
        targetProjects.map((p) =>
          api.put(`/projects/${p.id}`, { featured: shouldFeature }).catch(() => null)
        )
      );
      setProjects((prev) => {
        const targetIds = new Set(targetProjects.map((tp) => tp.id));
        return prev.map((p) => (targetIds.has(p.id) ? { ...p, featured: shouldFeature } : p));
      });
      success(shouldFeature ? `Added ${targetProjects.length} projects to Homepage Carousel!` : `Removed ${targetProjects.length} projects from Homepage Carousel.`);
    } catch (err) {
      error('Failed to update projects.');
    } finally {
      setProjectsLoading(false);
    }
  };

  const filteredProjectsList = projects.filter((p) => {
    if (projectFilter === 'featured' && !p.featured) return false;
    if (projectFilter === 'hidden' && p.featured) return false;
    if (projectCategory !== 'All' && p.category !== projectCategory) return false;
    if (projectSearch.trim()) {
      const q = projectSearch.toLowerCase();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchClient = (p.client || '').toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      return matchTitle || matchClient || matchCat;
    }
    return true;
  });

  const featuredCount = projects.filter((p) => p.featured).length;

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

      {/* ========================================================================= */}
      {/* 1. DEDICATED HOMEPAGE 3D CAROUSEL FEATURED PROJECTS MANAGER               */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border-2 border-teal-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-950/40 shrink-0">
              <Star className="w-6 h-6 fill-teal-400/30" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold font-display text-white">
                  Homepage 3D Carousel Projects Manager
                </h2>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{featuredCount} Active on 3D Carousel</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Choose exactly which commercial designs and reels appear in the homepage 3D coverflow slider. Click the toggle switch on any project to show or hide instantly.
              </p>
            </div>
          </div>

          {/* Batch Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleBulkToggle(true)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold hover:bg-teal-500 hover:text-zinc-950 transition-all cursor-pointer shadow-md"
            >
              ✓ Show All in Filter
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggle(false)}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-bold hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
            >
              ✕ Hide All in Filter
            </button>
          </div>
        </div>

        {/* Toolbar: Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950/70 p-3 rounded-2xl border border-zinc-800/80">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setProjectFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                projectFilter === 'all'
                  ? 'bg-teal-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setProjectFilter('featured')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                projectFilter === 'featured'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-900 text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              🟢 Showing on Homepage ({featuredCount})
            </button>
            <button
              type="button"
              onClick={() => setProjectFilter('hidden')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                projectFilter === 'hidden'
                  ? 'bg-zinc-700 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              ⚪ Hidden ({projects.length - featuredCount})
            </button>
          </div>

          {/* Category & Search */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium focus:border-teal-500 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Logo & Branding">Logo & Branding</option>
              <option value="Ads Creative">Ads Creative</option>
              <option value="Cover Branding">Cover Branding</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="UGC Video">UGC Video</option>
            </select>

            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        {projectsLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            <span className="text-xs font-medium">Loading portfolio projects...</span>
          </div>
        ) : filteredProjectsList.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 space-y-2 bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-800">
            <FolderKanban className="w-8 h-8 mx-auto text-zinc-600" />
            <p className="text-sm font-medium text-zinc-300">No projects found for current filter.</p>
            <p className="text-xs text-zinc-500">Try adjusting your search or category selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProjectsList.map((project) => {
              const isFeatured = Boolean(project.featured);
              const isBusy = togglingId === project.id;

              return (
                <div
                  key={project.id}
                  className={`rounded-2xl border transition-all duration-300 p-3.5 flex flex-col justify-between space-y-3 ${
                    isFeatured
                      ? 'bg-zinc-900/90 border-teal-500/50 shadow-lg shadow-teal-950/30 ring-1 ring-teal-500/20'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Thumbnail & Badges */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img
                      src={project.coverImage || 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&auto=format&fit=crop&q=80'}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      {project.category}
                    </div>

                    {isFeatured && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-zinc-950 text-[10px] font-black shadow-md flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-zinc-950" />
                        <span>3D CAROUSEL</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Client Info */}
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-white truncate" title={project.title}>
                      {project.title}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {project.client ? `Client: ${project.client}` : 'Personal Project'}
                    </p>
                  </div>

                  {/* Big Toggle Switch Button */}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleToggleFeatured(project)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      isFeatured
                        ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-500/20'
                        : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-700 hover:border-teal-500/50 hover:bg-teal-500/10'
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isFeatured ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Showing on Homepage</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to 3D Carousel</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
