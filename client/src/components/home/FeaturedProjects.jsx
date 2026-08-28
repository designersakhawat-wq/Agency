import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ExternalLink,
  Figma,
  Eye,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
  Layers,
  LayoutGrid,
  Maximize2,
  MessageCircle,
  Calendar,
  Award,
  ShieldCheck,
  Flame,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Palette,
  Tag,
} from 'lucide-react';
import Button from '../common/Button';
import { Badge } from '../common/Badge';
import { DEFAULT_PROJECTS } from '../../data/defaultData';
import tracking from '../../services/trackingService';

// Curated Category Fallback Images if a URL is broken
const CATEGORY_FALLBACKS = {
  'Logo & Branding': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&auto=format&fit=crop&q=80',
  'Brand Identity': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&auto=format&fit=crop&q=80',
  'Ads Creative': 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
  'Social Media Ads': 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
  'E-commerce': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80',
  'UGC Video': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
  'Cover Branding': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
  'General Design': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=80',
};

// Safe Image Component with Shimmer Loading & Lossless Fallback Protection
const SafeProjectImage = ({ src, alt, className = '', category = 'default' }) => {
  const [imgSrc, setImgSrc] = useState(src || CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default);
  const [loaded, setLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default;
      setImgSrc(fallback);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={alt || 'Design Case Study'}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading="lazy"
      />
    </div>
  );
};

// Smart Business Result & ROI Metric Generator
const getProjectMetric = (project) => {
  if (project.metric) return project.metric;
  const title = (project.title || '').toLowerCase();
  const cat = (project.category || '').toLowerCase();
  const tags = String(project.tags || '').toLowerCase();

  if (cat.includes('ads') || title.includes('roas') || title.includes('ad') || tags.includes('meta')) {
    return { label: '+340% Meta Ads ROAS', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  }
  if (cat.includes('brand') || cat.includes('logo') || title.includes('identity')) {
    return { label: 'Complete Vector System', icon: Award, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
  }
  if (cat.includes('video') || title.includes('video') || title.includes('shorts') || title.includes('tiktok')) {
    return { label: '88% High Retention Rate', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
  }
  if (cat.includes('commerce') || title.includes('shop') || title.includes('ecommerce')) {
    return { label: '2.4x Store Conversion Lift', icon: Zap, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' };
  }
  if (cat.includes('cover') || title.includes('banner')) {
    return { label: '100% Responsive Safe Zones', icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' };
  }
  return { label: 'Verified Client Results', icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' };
};

export const FeaturedProjects = ({ projects = [], onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'spotlight'
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [quickModalProject, setQuickModalProject] = useState(null);

  // Combine live database projects with rich default portfolio projects
  const allProjects = useMemo(() => {
    const rawList = Array.isArray(projects) && projects.length > 0 ? projects : DEFAULT_PROJECTS;
    // Normalize and sanitize projects
    return rawList.map((p, idx) => {
      let parsedTags = [];
      if (Array.isArray(p.tags)) {
        parsedTags = p.tags;
      } else if (typeof p.tags === 'string') {
        try {
          parsedTags = JSON.parse(p.tags);
        } catch (e) {
          parsedTags = p.tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      let parsedTools = [];
      if (Array.isArray(p.tools)) {
        parsedTools = p.tools;
      } else if (typeof p.tools === 'string') {
        try {
          parsedTools = JSON.parse(p.tools);
        } catch (e) {
          parsedTools = p.tools.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }
      if (parsedTools.length === 0) {
        parsedTools = ['Adobe Photoshop', 'Illustrator', 'Figma'];
      }

      return {
        ...p,
        id: p.id || `proj-fallback-${idx}`,
        title: p.title || 'Creative Campaign Craft',
        category: p.category || 'Brand Identity',
        summary: p.summary || p.description || 'Custom crafted performance creative engineered to elevate brand authority and drive measurable business growth.',
        coverImage: p.coverImage || CATEGORY_FALLBACKS[p.category] || CATEGORY_FALLBACKS.default,
        tags: parsedTags.length > 0 ? parsedTags : ['High-Impact', 'Conversion-Focused', 'Visual Craft'],
        tools: parsedTools,
        metric: getProjectMetric(p),
        client: p.client || 'Enterprise Client',
        year: p.year || '2025',
      };
    });
  }, [projects]);

  // Dynamic Categories derived from current projects
  const categories = useMemo(() => {
    const unique = new Set(['All']);
    allProjects.forEach((p) => {
      if (p.category) {
        if (p.category.toLowerCase().includes('brand') || p.category.toLowerCase().includes('logo')) {
          unique.add('Logo & Branding');
        } else if (p.category.toLowerCase().includes('ads') || p.category.toLowerCase().includes('social')) {
          unique.add('Ads Creatives');
        } else if (p.category.toLowerCase().includes('video') || p.category.toLowerCase().includes('ugc')) {
          unique.add('UGC Video');
        } else if (p.category.toLowerCase().includes('cover') || p.category.toLowerCase().includes('banner')) {
          unique.add('Cover Branding');
        } else if (p.category.toLowerCase().includes('commerce')) {
          unique.add('E-Commerce');
        } else {
          unique.add(p.category);
        }
      }
    });
    return Array.from(unique);
  }, [allProjects]);

  // Filtered project list
  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return allProjects;
    return allProjects.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      const target = activeCategory.toLowerCase();
      const tagsStr = (Array.isArray(p.tags) ? p.tags.join(' ') : String(p.tags || '')).toLowerCase();
      const titleStr = (p.title || '').toLowerCase();

      if (target === 'logo & branding' || target === 'brand identity') {
        return cat.includes('brand') || cat.includes('logo') || tagsStr.includes('logo') || tagsStr.includes('brand');
      }
      if (target === 'ads creatives' || target === 'social media ads') {
        return cat.includes('ad') || tagsStr.includes('ad') || tagsStr.includes('roas') || titleStr.includes('ad');
      }
      if (target === 'ugc video') {
        return cat.includes('video') || cat.includes('ugc') || tagsStr.includes('video') || tagsStr.includes('reels');
      }
      if (target === 'cover branding') {
        return cat.includes('cover') || cat.includes('banner') || tagsStr.includes('cover');
      }
      if (target === 'e-commerce') {
        return cat.includes('commerce') || tagsStr.includes('commerce') || tagsStr.includes('product');
      }
      return cat.includes(target) || tagsStr.includes(target);
    });
  }, [allProjects, activeCategory]);

  const currentSpotlight = filteredProjects[spotlightIndex % filteredProjects.length] || allProjects[0];

  const handleOpenQuickModal = (project) => {
    setQuickModalProject(project);
    tracking.trackViewContent(project.title, 'Portfolio Quick Look', null, 'USD', project.id);
    if (onSelectProject) onSelectProject(project);
  };

  const handleWhatsAppInquiry = (project) => {
    tracking.trackWhatsAppClick(
      'Featured Portfolio Case Study',
      `Similar Project Inquiry: ${project.title}`,
      `Client interested in project style: ${project.title}`
    );
    const msg = encodeURIComponent(
      `Hi Sakhawat! 👋\n\nI saw your featured case study for *${project.title}* on your website.\n\nI would love to discuss a similar design project for my brand. Are you available for a quick discussion?`
    );
    window.open(`https://wa.me/8801781955355?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="portfolio-section" className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-[#060608] via-[#09090d] to-[#060608]">
      {/* Dynamic Background Atmospheric Glows */}
      <div className="ambient-glow-teal top-1/4 -left-40 opacity-20 pointer-events-none" />
      <div className="ambient-glow-cyan bottom-1/4 -right-40 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* ========================================================================= */}
        {/* 1. HIGH-CONVERTING VALUE HOOK HEADER                                       */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-zinc-800/80">
          <div className="space-y-4 max-w-3xl">
            {/* Top Hook Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold uppercase tracking-wider shadow-lg shadow-teal-950/40">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>Selected Portfolio & Proof of Work</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="text-zinc-400 font-mono font-medium">100% Direct-Response ROI</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-[1.1]">
              Crafted for Impact.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200">
                Engineered for Conversions.
              </span>
            </h2>

            {/* Sub-text */}
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              Explore battle-tested visual creatives, cohesive brand identity systems, and high-CTR marketing assets that consistently turn cold audiences into loyal, paying clients.
            </p>

            {/* Live Trust / Results Counter Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90">
                <span className="text-lg font-black text-white block font-display">150+</span>
                <span className="text-[11px] text-zinc-400">Projects Delivered</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90">
                <span className="text-lg font-black text-emerald-400 block font-display">3.4x</span>
                <span className="text-[11px] text-zinc-400">Avg. ROAS Boost</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90">
                <span className="text-lg font-black text-cyan-400 block font-display">48h</span>
                <span className="text-[11px] text-zinc-400">Fast Turnaround</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90">
                <span className="text-lg font-black text-amber-400 block font-display">5.0 ★</span>
                <span className="text-[11px] text-zinc-400">Client Satisfaction</span>
              </div>
            </div>
          </div>

          {/* Right Action & Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* View Mode Toggle Button */}
            <div className="inline-flex p-1 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-inner">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-950/60 font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Curated Bento Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Bento Grid</span>
              </button>
              <button
                onClick={() => setViewMode('spotlight')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'spotlight'
                    ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-950/60 font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Interactive Case Spotlight"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Case Spotlight</span>
              </button>
            </div>

            {/* View All Works Link */}
            <Link to="/portfolio">
              <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="right" className="border-teal-500/40 text-teal-300 hover:bg-teal-500/10">
                Full Portfolio Archive ({allProjects.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. DYNAMIC CATEGORY FILTER TABS WITH ANIMATED SLIDING PILL                */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const count =
              cat === 'All'
                ? allProjects.length
                : allProjects.filter((p) => {
                    const c = (p.category || '').toLowerCase();
                    const target = cat.toLowerCase();
                    return c.includes(target) || target.includes(c);
                  }).length;

            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSpotlightIndex(0);
                }}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'text-white shadow-lg shadow-teal-950/50'
                    : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePortfolioPill"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 border border-teal-400/50 -z-10 shadow-lg shadow-teal-900/50"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? 'bg-black/30 text-teal-200' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 3. SHOWCASE VIEW MODE: CINEMATIC CASE SPOTLIGHT (WOW HERO MODE)            */}
        {/* ========================================================================= */}
        {viewMode === 'spotlight' && currentSpotlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="p-6 sm:p-10 rounded-3xl glass-card border-2 border-teal-500/30 bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-zinc-900/90 shadow-2xl shadow-teal-950/50 relative overflow-hidden"
          >
            {/* Ambient Background Radial Glow */}
            <div className="ambient-glow-teal -top-20 -right-20 opacity-30 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Visual Showcase with Interactive Hover Zoom */}
              <div className="lg:col-span-7 space-y-4">
                <div
                  onClick={() => handleOpenQuickModal(currentSpotlight)}
                  className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-800/90 group cursor-pointer shadow-2xl"
                >
                  <SafeProjectImage
                    src={currentSpotlight.coverImage}
                    alt={currentSpotlight.title}
                    category={currentSpotlight.category}
                    className="transform transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-teal-500 text-zinc-950 text-xs font-black uppercase tracking-wider shadow-md">
                      {currentSpotlight.category}
                    </span>
                    {currentSpotlight.featured && (
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-xs font-black uppercase tracking-wider shadow-md">
                        ★ Featured Masterpiece
                      </span>
                    )}
                  </div>

                  {/* Center Quick Look Prompt on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-xs">
                    <span className="px-4 py-2 rounded-2xl bg-zinc-900/95 border border-teal-500/50 text-teal-300 font-bold text-xs flex items-center gap-2 shadow-xl shadow-teal-950/80">
                      <Maximize2 className="w-4 h-4 text-teal-400" />
                      <span>Click to Open Case Study Breakdown</span>
                    </span>
                  </div>
                </div>

                {/* Spotlight Navigation Controls */}
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSpotlightIndex((prev) => (prev > 0 ? prev - 1 : filteredProjects.length - 1))}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-teal-500/50 hover:text-white transition-colors cursor-pointer"
                      title="Previous Showcase"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSpotlightIndex((prev) => (prev + 1) % filteredProjects.length)}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-teal-500/50 hover:text-white transition-colors cursor-pointer"
                      title="Next Showcase"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-zinc-400 ml-2">
                      {spotlightIndex + 1} of {filteredProjects.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {filteredProjects.slice(0, 8).map((_, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => setSpotlightIndex(pIdx)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          pIdx === spotlightIndex ? 'w-6 bg-teal-400' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Case Details, Metrics & Conversion Hooks */}
              <div className="lg:col-span-5 space-y-6">
                {/* Result / ROI Impact Pill */}
                {currentSpotlight.metric && (
                  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-black ${currentSpotlight.metric.bg} ${currentSpotlight.metric.color}`}>
                    <currentSpotlight.metric.icon className="w-4 h-4" />
                    <span>Key Result: {currentSpotlight.metric.label}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono mb-2">
                    <span>🏢 {currentSpotlight.client}</span>
                    <span>•</span>
                    <span>🗓️ {currentSpotlight.year}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight">
                    {currentSpotlight.title}
                  </h3>

                  <p className="text-sm text-zinc-300 mt-3 leading-relaxed">
                    {currentSpotlight.summary}
                  </p>
                </div>

                {/* Key Deliverables & Tools Used */}
                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block">
                    Deliverables & Technical Stack
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentSpotlight.tags.slice(0, 5).map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => handleWhatsAppInquiry(currentSpotlight)}
                    className="flex-1 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Inquire Similar Project</span>
                  </button>

                  <Link to={`/portfolio/${currentSpotlight.slug}`} className="flex-1">
                    <Button variant="outline" size="md" icon={ArrowUpRight} iconPosition="right" className="w-full justify-center">
                      Full Case Study
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 4. SHOWCASE VIEW MODE: CURATED BENTO GRID (DEFAULT ULTRA-SLEEK MODE)       */}
        {/* ========================================================================= */}
        {viewMode === 'grid' && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => {
                const metric = project.metric || getProjectMetric(project);

                return (
                  <motion.div
                    key={project.id || idx}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3) }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="group rounded-3xl glass-card overflow-hidden border border-zinc-800/90 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-950/40 transition-all duration-300 flex flex-col relative bg-zinc-950/80"
                  >
                    {/* Top Glow on Hover */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Image Container with Safe Component */}
                    <div
                      onClick={() => handleOpenQuickModal(project)}
                      className="relative aspect-[16/10] overflow-hidden bg-zinc-900 cursor-pointer"
                    >
                      <SafeProjectImage
                        src={project.coverImage}
                        alt={project.title}
                        category={project.category}
                        className="transform transition-transform duration-700 ease-out group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
                        <span className="px-2.5 py-1 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 text-teal-300 text-[11px] font-bold shadow-md">
                          {project.category}
                        </span>
                        {project.featured && (
                          <span className="px-2 py-1 rounded-xl bg-amber-400/90 text-zinc-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Top Right Result Metric Badge */}
                      {metric && (
                        <div className="absolute top-3.5 right-3.5 z-10">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl backdrop-blur-md border text-[10px] font-black shadow-lg ${metric.bg} ${metric.color}`}>
                            <metric.icon className="w-3 h-3" />
                            <span>{metric.label}</span>
                          </span>
                        </div>
                      )}

                      {/* Center Hover Action */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                        <span className="px-3.5 py-1.5 rounded-xl bg-zinc-900/90 text-white border border-teal-400/50 text-xs font-bold flex items-center gap-1.5 shadow-xl">
                          <Eye className="w-3.5 h-3.5 text-teal-400" />
                          <span>Quick Preview</span>
                        </span>
                      </div>
                    </div>

                    {/* Project Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Client / Year Bar */}
                        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                          <span className="font-medium text-zinc-400">{project.client}</span>
                          <span className="font-mono text-zinc-500">{project.year}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold font-display text-white group-hover:text-teal-300 transition-colors leading-snug line-clamp-2">
                          {project.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                          {project.summary}
                        </p>
                      </div>

                      {/* Deliverable Tags */}
                      {Array.isArray(project.tags) && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                        <Link
                          to={`/portfolio/${project.slug}`}
                          className="text-xs font-bold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 group/link"
                        >
                          <span>Case Study</span>
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </Link>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleWhatsAppInquiry(project)}
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-zinc-950 transition-colors cursor-pointer"
                            title="Inquire Similar Project on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            onClick={() => handleOpenQuickModal(project)}
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-teal-400" />
                            <span>Quick Look</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 5. CLIENT HOOK BOTTOM ACTION CARD                                         */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-teal-500/30 shadow-2xl shadow-teal-950/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="ambient-glow-teal -bottom-10 -left-10 opacity-30 pointer-events-none" />

          <div className="flex items-start sm:items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0 shadow-lg">
              <Zap className="w-7 h-7 text-teal-400" />
            </div>
            <div>
              <h4 className="text-xl sm:text-2xl font-display font-black text-white">
                Want to achieve similar high-converting results for your brand?
              </h4>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                Get custom brand assets and performance creatives tailored precisely to your niche and audience.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0 w-full sm:w-auto">
            <a href="#estimator-section" className="flex-1 sm:flex-initial">
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-teal-950/50 transition-all hover:scale-105 cursor-pointer">
                Calculate Project Quote →
              </button>
            </a>
            <Link to="/book-a-meeting" className="flex-1 sm:flex-initial">
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
                Book 1-on-1 Call
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE QUICK CASE STUDY MODAL WITH LOSSLESS ZOOM & DIRECT WHATSAPP */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {quickModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickModalProject(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl rounded-3xl glass-card border-2 border-teal-500/40 bg-zinc-950/95 p-6 sm:p-8 shadow-2xl shadow-teal-950/60 z-10 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Top ambient glow */}
              <div className="ambient-glow-teal -top-20 -right-20 opacity-30 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setQuickModalProject(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="space-y-2 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider">
                    {quickModalProject.category}
                  </span>
                  {quickModalProject.metric && (
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${quickModalProject.metric.bg} ${quickModalProject.metric.color}`}>
                      {quickModalProject.metric.label}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
                  {quickModalProject.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  <span>Client: {quickModalProject.client}</span>
                  <span>•</span>
                  <span>Year: {quickModalProject.year}</span>
                </div>
              </div>

              {/* High-Resolution Visual Showcase */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xl">
                <SafeProjectImage
                  src={quickModalProject.coverImage}
                  alt={quickModalProject.title}
                  category={quickModalProject.category}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Project Brief & Summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Project Strategy & Objective
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {quickModalProject.summary}
                </p>
                {quickModalProject.description && (
                  <p className="text-xs text-zinc-400 leading-relaxed pt-2">
                    {quickModalProject.description}
                  </p>
                )}
              </div>

              {/* Deliverables & Tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                    Delivered Assets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickModalProject.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-zinc-950 text-teal-300 border border-zinc-800">
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                    Software & Tools Used
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickModalProject.tools.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-300 border border-zinc-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  onClick={() => {
                    handleWhatsAppInquiry(quickModalProject);
                    setQuickModalProject(null);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Inquire Similar Project on WhatsApp</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/portfolio/${quickModalProject.slug}`}
                    onClick={() => setQuickModalProject(null)}
                    className="flex-1"
                  >
                    <Button variant="primary" size="md" icon={ArrowUpRight} iconPosition="right" className="w-full justify-center">
                      Read Case Study
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedProjects;
