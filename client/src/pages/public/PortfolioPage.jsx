import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import {
  Sparkles,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  X,
  Layers,
  Calendar,
  Zap,
  Star,
  CheckCircle2,
  FolderKanban,
  Maximize2,
  Palette,
  Megaphone,
  Video,
  Layout,
  Flame,
  Play,
  Film,
  Smartphone,
  Tv,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { DEFAULT_PROJECTS, DEFAULT_SERVICES } from '../../data/defaultData';

// Helper to extract clean YouTube Embed URL
export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`
    : null;
};

// Helper to auto-detect whether a video is 9:16 vertical (Shorts / Reels / TikTok / UGC)
export const isVerticalVideo = (project) => {
  if (!project) return false;
  const url = (project.liveUrl || '').toLowerCase();
  const cat = (project.category || '').toLowerCase();
  const tags = Array.isArray(project.tags) ? project.tags.map((t) => t.toLowerCase()) : [];

  if (url.includes('shorts') || url.includes('reel') || url.includes('tiktok') || url.includes('vertical')) {
    return true;
  }
  if (cat.includes('ugc') || cat.includes('reels') || cat.includes('shorts') || cat.includes('tiktok') || cat.includes('video')) {
    return true;
  }
  if (tags.some((t) => t.includes('short') || t.includes('reel') || t.includes('vertical') || t.includes('9:16') || t.includes('ugc'))) {
    return true;
  }
  return false;
};

// Map icons to service slugs
const getServiceIcon = (slug) => {
  if (slug.includes('logo') || slug.includes('brand')) return Palette;
  if (slug.includes('ads') || slug.includes('social')) return Megaphone;
  if (slug.includes('video') || slug.includes('ugc')) return Video;
  if (slug.includes('cover') || slug.includes('banner')) return Layout;
  return Sparkles;
};

// Reusable Smooth Horizontal Service Slider Component (60 FPS Native CSS Smooth Scrolling)
const ServicePortfolioSlider = ({ service, projects, onOpenLightbox }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const IconComponent = getServiceIcon(service.slug || '');

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability, { passive: true });
      window.addEventListener('resize', checkScrollability);
    }
    return () => {
      if (container) container.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [projects]);

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = Math.max(scrollContainerRef.current.clientWidth * 0.75, 320);
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!projects || projects.length === 0) return null;

  return (
    <section
      id={service.slug}
      className="scroll-mt-32 p-6 sm:p-8 rounded-3xl bg-zinc-950/70 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-6 transition-all duration-300 hover:border-teal-500/30"
    >
      {/* 1. SECTION HEADER WITH SERVICE INFO & SLIDER ARROWS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-teal-400/10 border border-teal-500/30 text-teal-300 flex items-center justify-center shadow-lg shadow-teal-950/40 shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight">
                {service.title}
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                🟢 {projects.length} Works
              </span>
            </div>
            {service.tagline && (
              <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
                {service.tagline}
              </p>
            )}
          </div>
        </div>

        {/* Slider Navigation Arrows */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-teal-500 hover:text-zinc-950 hover:border-teal-400 shadow-md active:scale-95'
                : 'bg-zinc-950 border-zinc-900 text-zinc-700 cursor-not-allowed opacity-40'
            }`}
            aria-label="Previous items"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              canScrollRight
                ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-teal-500 hover:text-zinc-950 hover:border-teal-400 shadow-md active:scale-95'
                : 'bg-zinc-950 border-zinc-900 text-zinc-700 cursor-not-allowed opacity-40'
            }`}
            aria-label="Next items"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. ULTRA-SMOOTH HORIZONTAL SNAP SLIDER TRACK */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 -mx-2 px-2"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {projects.map((project, idx) => {
          const hasVideo = Boolean(getYouTubeEmbedUrl(project.liveUrl));
          const isVertical = isVerticalVideo(project);

          return (
            <div
              key={project.id || idx}
              className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start rounded-2xl bg-zinc-900/90 border border-zinc-800/80 hover:border-teal-500/50 overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/10"
            >
              {/* Thumbnail Image / Video Trigger */}
              <div
                className="relative aspect-square w-full bg-zinc-950 overflow-hidden cursor-pointer"
                onClick={() => onOpenLightbox(project)}
              >
                <img
                  src={project.coverImage}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                  onError={(e) => {
                    e.target.src =
                      'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Video Play Button Overlay if YouTube Video */}
                {hasVideo ? (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                    <div className="w-14 h-14 rounded-full bg-teal-500/90 text-zinc-950 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-teal-400 transition-all">
                      <Play className="w-6 h-6 fill-zinc-950 ml-0.5" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl">
                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                      <span>Click to Preview</span>
                    </span>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md text-teal-300 border border-white/10">
                    {project.category || service.title}
                  </span>
                  {hasVideo && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-600/90 text-white flex items-center gap-1 shadow-md">
                      <Film className="w-2.5 h-2.5" /> {isVertical ? '9:16 Reel' : 'Video'}
                    </span>
                  )}
                </div>
              </div>

              {/* Content & Action */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-display text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                    {project.title}
                  </h4>
                  {project.client && (
                    <p className="text-[11px] text-zinc-400 font-medium line-clamp-1">
                      Client: <span className="text-zinc-300">{project.client}</span>
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onOpenLightbox(project)}
                    className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {hasVideo ? (
                      <>
                        <Play className="w-3 h-3 fill-teal-400" />
                        <span>Watch {isVertical ? 'Reel' : 'Video'}</span>
                      </>
                    ) : (
                      <>
                        <span>Quick View</span>
                        <Maximize2 className="w-3 h-3" />
                      </>
                    )}
                  </button>

                  <Link
                    to={`/portfolio/${project.slug}`}
                    className="text-zinc-400 hover:text-white font-semibold flex items-center gap-1"
                  >
                    <span>Case Study</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. SECTION FOOTER: VIEW MORE IN SERVICE BUTTON */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-zinc-400">
          Showing {projects.length} curated works for <strong>{service.title}</strong>
        </span>

        <Link
          to={`/services/${service.slug}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black text-xs transition-all shadow-md hover:shadow-teal-500/20 hover:scale-[1.02] active:scale-98 cursor-pointer"
        >
          <span>View More on {service.title} Page</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export const PortfolioPage = () => {
  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_all_projects');
      return cached ? JSON.parse(cached) : DEFAULT_PROJECTS;
    } catch (e) {
      return DEFAULT_PROJECTS;
    }
  });
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxProject, setLightboxProject] = useState(null);
  const [videoAspect, setVideoAspect] = useState('vertical');

  // Fetch projects and services from backend
  const fetchData = async () => {
    try {
      const [projRes, servRes] = await Promise.all([
        api.get('/projects').catch(() => null),
        api.get('/services').catch(() => null),
      ]);

      if (projRes && projRes.success && Array.isArray(projRes.data)) {
        setProjects(projRes.data);
        localStorage.setItem('sakhawat_cached_all_projects', JSON.stringify(projRes.data));
      }

      if (servRes && servRes.success && Array.isArray(servRes.data) && servRes.data.length > 0) {
        setServices(servRes.data);
      }
    } catch (err) {
      console.error('Error loading portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Open Lightbox with auto-detected aspect ratio
  const handleOpenLightbox = (project) => {
    setLightboxProject(project);
    setVideoAspect(isVerticalVideo(project) ? 'vertical' : 'horizontal');
  };

  // Filter projects by search query (100% null-safe)
  const searchedProjects = useMemo(() => {
    const safeProjects = (projects || []).filter(Boolean);
    if (!searchQuery.trim()) return safeProjects;
    const q = searchQuery.toLowerCase().trim();
    return safeProjects.filter((p) => {
      if (!p) return false;
      const titleMatch = p.title && p.title.toLowerCase().includes(q);
      const clientMatch = p.client && p.client.toLowerCase().includes(q);
      const catMatch = p.category && p.category.toLowerCase().includes(q);
      const tagMatch = p.tags && Array.isArray(p.tags) && p.tags.some((t) => t && t.toLowerCase().includes(q));
      return titleMatch || clientMatch || catMatch || tagMatch;
    });
  }, [projects, searchQuery]);

  // Group projects by service (100% null-safe)
  const serviceSections = useMemo(() => {
    const safeServices = (services || []).filter(Boolean);
    return safeServices.map((service) => {
      const sSlug = service.slug || '';
      const sTitle = service.title || '';
      const serviceProjects = searchedProjects.filter((p) => {
        if (!p) return false;
        const pCat = (p.category || '').toLowerCase();
        if (p.serviceId === service.id) return true;
        if (p.serviceSlug === service.slug) return true;
        if (p.category === service.title) return true;
        if (sTitle && pCat.includes(sTitle.toLowerCase())) return true;
        if (
          sSlug.includes('logo') &&
          (pCat.includes('logo') || pCat.includes('brand'))
        )
          return true;
        if (
          sSlug.includes('ads') &&
          (pCat.includes('ads') || pCat.includes('social'))
        )
          return true;
        if (
          sSlug.includes('ugc') &&
          (pCat.includes('ugc') || pCat.includes('video'))
        )
          return true;
        if (
          sSlug.includes('cover') &&
          (pCat.includes('cover') || pCat.includes('banner'))
        )
          return true;
        return false;
      });

      return {
        service,
        projects: serviceProjects,
      };
    });
  }, [services, searchedProjects]);

  // Projects that don't belong to the above 4 primary services
  const generalProjects = useMemo(() => {
    const assignedIds = new Set();
    serviceSections.forEach((sec) => {
      if (sec && Array.isArray(sec.projects)) {
        sec.projects.forEach((p) => {
          if (p && p.id) assignedIds.add(p.id);
        });
      }
    });
    return searchedProjects.filter((p) => p && p.id && !assignedIds.has(p.id));
  }, [serviceSections, searchedProjects]);

  const scrollToSection = (slug) => {
    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const youtubeEmbedUrl = useMemo(() => {
    return lightboxProject ? getYouTubeEmbedUrl(lightboxProject.liveUrl) : null;
  }, [lightboxProject]);

  return (
    <div className="pt-44 sm:pt-48 pb-28 min-h-screen relative overflow-hidden bg-black text-white">
      {/* Background Glow Highlights */}
      <div className="ambient-glow-teal top-24 right-1/4 opacity-20 pointer-events-none" />
      <div className="ambient-glow-lime bottom-48 left-12 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* =========================================================================
            1. HERO HEADER SECTION
            ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Multi-Service Showcase</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
            Design Craft & <br />
            <span className="text-gradient">Portfolio By Service</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Browse high-converting design deliverables and UGC video content organized by service. Click to preview works or explore full service details and pricing.
          </p>
        </div>

        {/* =========================================================================
            2. QUICK SERVICE JUMP BAR & SEARCH
            ========================================================================= */}
        <div className="p-3.5 rounded-3xl bg-zinc-950/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-3 sticky top-24 z-30">
          {/* Quick Jump Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full lg:w-auto py-1">
            <span className="text-xs font-bold text-zinc-400 hidden sm:inline pl-2 pr-1">Jump to:</span>
            {services.map((s) => {
              const matchedSection = serviceSections.find((sec) => sec.service.id === s.id);
              const count = matchedSection ? matchedSection.projects.length : 0;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.slug)}
                  className="px-4 py-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-white hover:border-teal-500/50 hover:bg-teal-500/10 text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <span>{s.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-teal-300 font-bold">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full lg:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all works..."
              className="w-full pl-9 pr-8 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-white text-xs font-medium focus:border-teal-500 focus:outline-none placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* =========================================================================
            3. DEDICATED SECTIONS FOR EACH SERVICE (With Left/Right Slider)
            ========================================================================= */}
        <div className="space-y-12">
          {serviceSections.map(({ service, projects: sProjects }) => (
            <ServicePortfolioSlider
              key={service.id}
              service={service}
              projects={sProjects}
              onOpenLightbox={handleOpenLightbox}
            />
          ))}

          {/* General Design / Other Showcase Section if any */}
          {generalProjects.length > 0 && (
            <ServicePortfolioSlider
              service={{
                id: 'general-design',
                title: 'General & Commercial Projects',
                slug: 'general-design',
                tagline: 'Multi-disciplinary digital branding and commercial marketing collateral.',
              }}
              projects={generalProjects}
              onOpenLightbox={handleOpenLightbox}
            />
          )}
        </div>

        {/* =========================================================================
            4. BOTTOM CTA BANNER
            ========================================================================= */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-teal-950/80 via-zinc-950 to-teal-950/80 border border-teal-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
              Ready to Upgrade Your Visual Creatives?
            </h2>
            <p className="text-sm text-zinc-300 max-w-xl mx-auto">
              Get in touch today for high-converting brand identity, advertising assets, and video creative solutions.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link to="/book-a-meeting">
              <Button variant="primary" size="lg" icon={Calendar} className="font-black px-8">
                Book Discovery Call
              </Button>
            </Link>
            <Link to="/services">
              <Button variant="secondary" size="lg" icon={Layers}>
                Explore All Services
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. CLEAN & SIMPLE HIGH-RESOLUTION PREVIEW MODAL
          ========================================================================= */}
      <Modal
        isOpen={!!lightboxProject}
        onClose={() => setLightboxProject(null)}
        title={lightboxProject?.title || 'Preview'}
        size="2xl"
      >
        {lightboxProject && (
          <div className="space-y-4">
            {/* If YouTube video is linked: Display dynamic aspect ratio player */}
            {youtubeEmbedUrl ? (
              <div className="space-y-3">
                {/* Aspect Ratio Switcher Controls */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-zinc-400">Player Size:</span>
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setVideoAspect('vertical')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        videoAspect === 'vertical'
                          ? 'bg-teal-500 text-zinc-950 font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>9:16 Reel</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVideoAspect('horizontal')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        videoAspect === 'horizontal'
                          ? 'bg-teal-500 text-zinc-950 font-black shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>16:9 Landscape</span>
                    </button>
                  </div>
                </div>

                {/* Video Player Container */}
                <div className="flex items-center justify-center py-1">
                  <div
                    className={`relative overflow-hidden bg-black border-2 border-teal-500/50 shadow-2xl transition-all duration-300 ${
                      videoAspect === 'vertical'
                        ? 'w-full max-w-[320px] sm:max-w-[340px] aspect-[9/16] max-h-[66vh] rounded-3xl'
                        : 'w-full aspect-video rounded-2xl max-h-[66vh]'
                    }`}
                  >
                    <iframe
                      src={youtubeEmbedUrl}
                      title={lightboxProject.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* High-Res Image Showcase */
              <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-[16/10] max-h-[66vh] flex items-center justify-center">
                <img
                  src={lightboxProject.coverImage}
                  alt={lightboxProject.title}
                  className="w-full h-full object-contain bg-zinc-950"
                />
              </div>
            )}

            {/* Simple Compact Footer Bar */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold">
                  {lightboxProject.category}
                </span>
                {lightboxProject.client && (
                  <span className="text-xs text-zinc-400">
                    {lightboxProject.client}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setLightboxProject(null)}
                >
                  Close
                </Button>
                <Link
                  to="/book-a-meeting"
                  onClick={() => setLightboxProject(null)}
                >
                  <Button variant="primary" size="sm" icon={Zap} className="font-bold">
                    Order Similar Work
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PortfolioPage;
