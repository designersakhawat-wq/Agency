import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileCheck,
  Clock,
  Palette,
  Megaphone,
  Video,
  Layout,
  TrendingUp,
  Layers,
  Flame,
  MessageCircle,
  Eye,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Grid,
  Play,
  Pause,
  Maximize2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import FaqAccordion from '../../components/home/FaqAccordion';
import { PackageActionModal } from '../../components/common/PackageActionModal';
import { DEFAULT_SERVICES, DEFAULT_FAQS, DEFAULT_PROJECTS, DEFAULT_SETTINGS } from '../../data/defaultData';
import { safeSetItem } from '../../utils/safeStorage';
import tracking from '../../services/trackingService';

const iconMap = {
  Palette: Palette,
  Megaphone: Megaphone,
  Video: Video,
  Layout: Layout,
  Sparkles: Sparkles,
  TrendingUp: TrendingUp,
};

// Fallback high-quality image if any URL fails
const FALLBACK_IMAGE = '/uploads/amazon-listing-images-electric-shaver-hero--1--1787766545048-828073166.jpg';

// Deliverables mapping per service
const SERVICE_DELIVERABLES_MAP = {
  'logo-branding': [
    { name: 'Master Vector Files', ext: '.AI / .EPS', desc: 'Infinite vector scaling for print, merchandise, billboards & embroidery' },
    { name: 'Web & Digital Exports', ext: '.SVG / .PNG', desc: 'Crisp transparent background assets, favicons, and app icons' },
    { name: 'Brand Guidelines Book', ext: 'PDF System', desc: 'Official color palettes (HEX, RGB, CMYK), typography & spacing rules' },
    { name: 'Social Profile Pack', ext: 'Multi-Format', desc: 'Avatar kits & social headers for LinkedIn, X/Twitter, and Facebook' },
  ],
  'ads-creative': [
    { name: 'Social Feed Creatives', ext: '1080x1080', desc: 'High-contrast direct-response static banners for Meta & LinkedIn' },
    { name: 'Story & Reels Vertical Ads', ext: '1080x1920', desc: 'Immersive full-screen 9:16 vertical graphics optimized for mobile feeds' },
    { name: 'Layered Master PSD', ext: '.PSD / Figma', desc: 'Organized, named layers ready for rapid in-house copywriting tweaks' },
    { name: 'A/B Hook Variations', ext: 'Multi-Angle', desc: 'Alternative visual hook angles to test headlines and maximize CTR' },
  ],
  'ugc-video': [
    { name: '4K/FHD Vertical Videos', ext: '.MP4 60FPS', desc: 'Mobile-first vertical format crafted for TikTok, Reels & Shorts' },
    { name: 'Dynamic Animated Captions', ext: 'Burned-In', desc: 'High-energy colored subtitles with emoji animations and beat SFX' },
    { name: 'Sound Design & Leveling', ext: 'Licensed Audio', desc: 'Beat-synced transitions, sound effects, and crystal audio clarity' },
    { name: 'High-CTR Cover Thumbnails', ext: '.JPG / .PNG', desc: 'Click-worthy video cover thumbnails designed to boost initial views' },
  ],
  'cover-branding': [
    { name: 'LinkedIn Header Suite', ext: 'Personal & Co.', desc: 'Safe-zone calibrated banners for personal profile & company pages' },
    { name: 'YouTube & Podcast Art', ext: '2560x1440', desc: 'Crisp TV, desktop, and phone-ready banner artwork with clear branding' },
    { name: 'Social Media Headers', ext: 'X / FB / IG', desc: 'Facebook page/group covers and Twitter/X header dimensions' },
    { name: 'Master Layered Source', ext: '.PSD / Figma', desc: 'Editable source files for easy future title or campaign updates' },
  ],
};

const processSteps = [
  { step: '01', title: 'Creative Consultation', desc: 'We align on your audience, aesthetic benchmarks, and campaign goals.', duration: 'Day 1' },
  { step: '02', title: 'Asset & Strategy Alignment', desc: 'Gathering raw product assets, copy hooks, format dimensions & moodboards.', duration: 'Day 1–2' },
  { step: '03', title: 'Art Direction & Drafting', desc: 'Crafting initial high-contrast visual concepts with direct-response hierarchy.', duration: 'Day 2–3' },
  { step: '04', title: 'Collaborative Refinement', desc: 'Fine-tuning details, color balance, and typography until 100% approved.', duration: 'Day 3–4' },
  { step: '05', title: 'Final Handover & Release', desc: 'Exporting organized master vector/source files with full commercial release.', duration: 'Final Day' },
];

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const { formatAmount, currencySymbol } = useCurrency();

  const defaultService =
    DEFAULT_SERVICES.find((s) => s.slug === slug || s.id === slug) || DEFAULT_SERVICES[0];

  const [data, setData] = useState(() => {
    try {
      const cachedServices = localStorage.getItem('sakhawat_cached_services');
      if (cachedServices) {
        const parsed = JSON.parse(cachedServices);
        const match = parsed.find((s) => s.slug === slug || s.id === slug);
        if (match) {
          return {
            service: match,
            packages: match.packages || defaultService?.packages || [],
            projects: [],
            faqs: DEFAULT_FAQS,
          };
        }
      }
    } catch (e) {}

    return {
      service: defaultService,
      packages: defaultService?.packages || [],
      projects: [],
      faqs: DEFAULT_FAQS,
    };
  });

  const [allStoredProjects, setAllStoredProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_all_projects');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [showStickyBar, setShowStickyBar] = useState(false);

  // Dynamic Backend Showcase Config
  const [showcaseConfig, setShowcaseConfig] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_showcase_config');
      return cached ? JSON.parse(cached) : DEFAULT_SETTINGS.service_showcase_config;
    } catch (e) {
      return DEFAULT_SETTINGS.service_showcase_config;
    }
  });

  // Lively Portfolio Slider State
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(showcaseConfig.autoplay !== false);
  const [viewMode, setViewMode] = useState(showcaseConfig.defaultViewMode || 'slider'); // 'slider' | 'grid'
  const [lightboxIndex, setLightboxIndex] = useState(null); // null | number

  // Modal State for Package Action (WhatsApp vs Book Meeting)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPkg, setModalPkg] = useState(null);

  // Instant Scroll to Top on page load / slug change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [srvRes, projRes, settingsRes] = await Promise.all([
          api.get(`/services/${slug}`).catch(() => null),
          api.get('/projects').catch(() => null),
          api.get('/settings').catch(() => null),
        ]);

        if (srvRes && srvRes.success && srvRes.data) {
          const freshService = srvRes.data.service;
          const freshPackages = freshService?.packages || srvRes.data.packages || [];
          setData((prev) => ({
            ...prev,
            ...srvRes.data,
            service: freshService || prev.service,
            packages: freshPackages.length > 0 ? freshPackages : prev.packages,
            faqs: srvRes.data.faqs || prev.faqs,
          }));
          if (freshService) {
            tracking.trackViewContent(freshService.title, 'Service Offering', null, 'USD', freshService.id);
          }
        }

        if (projRes && projRes.success && Array.isArray(projRes.data)) {
          setAllStoredProjects(projRes.data);
          safeSetItem('sakhawat_cached_all_projects', projRes.data);
        }

        if (settingsRes && settingsRes.success && settingsRes.data) {
          let conf = settingsRes.data.service_showcase_config;
          if (typeof conf === 'string') {
            try { conf = JSON.parse(conf); } catch (e) {}
          }
          if (conf && typeof conf === 'object') {
            setShowcaseConfig((prev) => ({ ...prev, ...conf }));
            if (conf.defaultViewMode) setViewMode(conf.defaultViewMode);
            if (conf.autoplay !== undefined) setIsAutoPlaying(conf.autoplay);
          }
        }
      } catch (err) {
        console.error('Service details fetch:', err);
      }
    };
    fetchData();
  }, [slug]);

  // Handle scroll for sticky conversion bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { service, faqs } = data;
  const ServiceIcon = iconMap[service.icon] || Palette;
  const packages = service.packages || data.packages || [];
  const features = Array.isArray(service.features) ? service.features : [];

  // Filter portfolio projects matching this service (strictly prioritize real uploaded items)
  const servicePortfolioProjects = useMemo(() => {
    // 1. Direct projects from backend service query
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      return data.projects;
    }

    // 2. Filter from all projects in DB / local storage
    if (Array.isArray(allStoredProjects) && allStoredProjects.length > 0) {
      const matchedStored = allStoredProjects.filter((p) => {
        if (!p || p.active === false) return false;
        if (p.serviceSlug === slug || (service?.id && p.serviceId === service.id)) return true;
        const pCat = (p.category || '').toLowerCase();
        const sTitle = (service?.title || '').toLowerCase();
        if (sTitle && pCat === sTitle) return true;
        if (slug.includes('logo') && (pCat.includes('logo') || pCat.includes('brand'))) return true;
        if (slug.includes('ads') && (pCat.includes('ads') || pCat.includes('social') || pCat.includes('post') || pCat.includes('creative'))) return true;
        if (slug.includes('ugc') && (pCat.includes('ugc') || pCat.includes('video'))) return true;
        if (slug.includes('cover') && (pCat.includes('cover') || pCat.includes('banner') || pCat.includes('header'))) return true;
        return false;
      });
      if (matchedStored.length > 0) return matchedStored;
    }

    // 3. Fallback to default mock projects only if no live items exist
    const matched = DEFAULT_PROJECTS.filter((p) => {
      if (p.serviceSlug && p.serviceSlug === slug) return true;
      if (slug.includes('logo') && (p.category.includes('Logo') || p.category.includes('Brand'))) return true;
      if (slug.includes('ads') && (p.category.includes('Ads') || p.category.includes('E-Commerce'))) return true;
      if (slug.includes('ugc') && (p.category.includes('UGC') || p.category.includes('Video'))) return true;
      if (slug.includes('cover') && (p.category.includes('Cover') || p.category.includes('Banner'))) return true;
      return false;
    });

    if (matched.length > 0) return matched;
    return DEFAULT_PROJECTS.slice(0, 6);
  }, [data.projects, allStoredProjects, slug, service]);

  const totalSlides = servicePortfolioProjects.length;

  // Reset slideIndex if it exceeds totalSlides
  useEffect(() => {
    if (slideIndex >= totalSlides && totalSlides > 0) {
      setSlideIndex(0);
    }
  }, [totalSlides, slideIndex]);

  // Auto-play timer for slider
  const intervalMs = showcaseConfig.autoplayInterval || 4000;
  useEffect(() => {
    if (!isAutoPlaying || viewMode !== 'slider' || totalSlides <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % totalSlides);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isAutoPlaying, viewMode, totalSlides, intervalMs]);

  const handlePrevSlide = () => {
    setSlideIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const deliverableItems = SERVICE_DELIVERABLES_MAP[slug] || SERVICE_DELIVERABLES_MAP['logo-branding'];

  // Lowest starting price
  const startingPrice = useMemo(() => {
    if (packages.length === 0) return 99;
    const prices = packages.map((p) => Number(p.price)).filter((p) => !isNaN(p));
    return prices.length > 0 ? Math.min(...prices) : 99;
  }, [packages]);

  // Open the dual-action WhatsApp vs Book Meeting modal
  const handleOpenActionModal = (pkg) => {
    setModalPkg(pkg);
    setModalOpen(true);
  };

  const defaultPopularPkg = packages.find((p) => p.isPopular) || packages[0] || { name: 'Standard Package', price: startingPrice };

  // Lightbox active project
  const currentLightboxProject = lightboxIndex !== null ? servicePortfolioProjects[lightboxIndex] : null;

  // Determine active ratio (supports per-service override, cover-branding presets, and global ratio)
  const defaultRatio = useMemo(() => {
    if (showcaseConfig.service_ratios && showcaseConfig.service_ratios[slug]) {
      return showcaseConfig.service_ratios[slug];
    }
    if (slug === 'cover-branding') {
      return showcaseConfig.cover_branding_aspect_ratio || 'fb-cover';
    }
    return showcaseConfig.aspectRatio || '1:1';
  }, [showcaseConfig, slug]);

  const [activeRatio, setActiveRatio] = useState(defaultRatio);

  useEffect(() => {
    setActiveRatio(defaultRatio);
  }, [defaultRatio]);

  // Aspect ratio classes based on active ratio
  let sliderContainerRatioClass = 'max-w-2xl mx-auto aspect-square';
  let gridCardRatioClass = 'aspect-square';

  if (activeRatio === 'fb-cover' || activeRatio === '820:312' || activeRatio === '2.63:1') {
    sliderContainerRatioClass = 'w-full max-w-4xl mx-auto aspect-[820/312]';
    gridCardRatioClass = 'aspect-[820/312]';
  } else if (activeRatio === 'linkedin-cover' || activeRatio === '1584:396' || activeRatio === '4:1') {
    sliderContainerRatioClass = 'w-full max-w-5xl mx-auto aspect-[1584/396]';
    gridCardRatioClass = 'aspect-[1584/396]';
  } else if (activeRatio === '16:9') {
    sliderContainerRatioClass = 'w-full max-w-4xl mx-auto aspect-[16/9]';
    gridCardRatioClass = 'aspect-[16/9]';
  } else if (activeRatio === '4:3') {
    sliderContainerRatioClass = 'max-w-3xl mx-auto aspect-[4/3]';
    gridCardRatioClass = 'aspect-[4/3]';
  } else if (activeRatio === '9:16') {
    sliderContainerRatioClass = 'max-w-md mx-auto aspect-[9/16]';
    gridCardRatioClass = 'aspect-[9/16]';
  }

  // Grid column class based on config and aspect ratio
  const gridColsSetting = Number(showcaseConfig.gridCols) || 3;
  let gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  if (activeRatio === 'fb-cover' || activeRatio === 'linkedin-cover') {
    gridColsClass = 'grid-cols-1 md:grid-cols-2';
  } else if (gridColsSetting === 2) {
    gridColsClass = 'grid-cols-1 sm:grid-cols-2';
  } else if (gridColsSetting === 4) {
    gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  }

  return (
    <div className="pt-44 sm:pt-48 pb-28 min-h-screen relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="ambient-glow-teal top-20 right-1/4 opacity-20 pointer-events-none" />
      <div className="ambient-glow-cyan bottom-1/4 left-10 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-24">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
          <Link to="/services" className="hover:text-teal-400 transition-colors flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            All Services
          </Link>
          <span>/</span>
          <span className="text-white font-bold">{service.title}</span>
        </div>

        {/* =========================================================================
            1. HERO SECTION: Animated, Direct & Action-Focused
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
        >
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider shadow-lg shadow-teal-950/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Specialized Creative Service</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight leading-tight">
              {service.title}
            </h1>

            {service.tagline && (
              <p className="text-base sm:text-xl font-medium text-teal-300">
                {service.tagline}
              </p>
            )}

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
              {service.description}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => handleOpenActionModal(defaultPopularPkg)}
                className="cursor-pointer"
              >
                <Button variant="primary" size="lg" icon={MessageCircle} className="font-bold shadow-xl shadow-teal-950/60">
                  Get Started (From {formatAmount(startingPrice)})
                </Button>
              </button>
              <Link to="/book-a-meeting" state={{ serviceName: service.title }}>
                <Button variant="secondary" size="lg" icon={Calendar}>
                  Book Discovery Call
                </Button>
              </Link>
            </div>

            {/* Trust Statement */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-teal-400 font-semibold">
                <ShieldCheck className="w-4 h-4" /> 100% Commercial Vector License
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-white">
                <Clock className="w-4 h-4 text-teal-400" /> Fast 24–48h Turnaround
              </span>
              <span>•</span>
              <span className="text-zinc-400">Unlimited Draft Revision Support</span>
            </div>
          </div>

          {/* Hero What's Included Card with Motion Hover Lift */}
          <div className="lg:col-span-5">
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="p-6 sm:p-8 rounded-3xl glass-card border border-teal-500/30 space-y-5 shadow-2xl bg-zinc-950/80 card-shine"
            >
              <div className="flex items-center justify-between">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30"
                >
                  <ServiceIcon className="w-6 h-6" />
                </motion.div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-teal-400">
                  Starting at {formatAmount(startingPrice)}
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold font-display text-white">
                  What You Get in This Service:
                </h3>
                <div className="space-y-2.5">
                  {features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span className="font-medium leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800/80 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Deliverable Formats:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(service.deliverables) && service.deliverables.length > 0 ? (
                    service.deliverables.map((deliv, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 font-mono"
                      >
                        {deliv}
                      </span>
                    ))
                  ) : (
                    ['.AI', '.PSD', '.SVG', '.PNG', '.PDF'].map((ext) => (
                      <span
                        key={ext}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-300 font-mono"
                      >
                        {ext}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* =========================================================================
            2. LIVELY INTERACTIVE PORTFOLIO SHOWCASE (Configurable 1:1 Square, Slider/Grid)
            ========================================================================= */}
        <div className="space-y-6">
          {/* Section Header with Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>{showcaseConfig.sectionBadge || 'Live Portfolio Gallery'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-black text-white">
                Recent Work in {service.title}
              </h2>
            </div>

            {/* Interactive Slider Controls, Ratio Toggle & View Toggle */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              {/* Aspect Ratio Switcher for Cover Branding / Multi-Ratio services */}
              {(slug === 'cover-branding' || activeRatio === 'fb-cover' || activeRatio === 'linkedin-cover') && (
                <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveRatio('fb-cover')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeRatio === 'fb-cover'
                        ? 'bg-blue-600 text-white font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Facebook Cover (820 × 312)"
                  >
                    <span className={`w-2 h-2 rounded-full ${activeRatio === 'fb-cover' ? 'bg-white' : 'bg-blue-400'}`} />
                    <span>FB Cover (820×312)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRatio('linkedin-cover')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeRatio === 'linkedin-cover'
                        ? 'bg-sky-600 text-white font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="LinkedIn Banner (1584 × 396)"
                  >
                    <span className={`w-2 h-2 rounded-full ${activeRatio === 'linkedin-cover' ? 'bg-white' : 'bg-sky-300'}`} />
                    <span>LinkedIn Banner (1584×396)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRatio('16:9')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeRatio === '16:9'
                        ? 'bg-teal-500 text-zinc-950 font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="16:9 Widescreen"
                  >
                    16:9
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveRatio('1:1')}
                    className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      activeRatio === '1:1'
                        ? 'bg-teal-500 text-zinc-950 font-black shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="1:1 Square"
                  >
                    1:1
                  </button>
                </div>
              )}
              {/* Autoplay Pause/Play Toggle */}
              {viewMode === 'slider' && (
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isAutoPlaying
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                  }`}
                  title={isAutoPlaying ? 'Pause automatic slide' : 'Resume automatic slide'}
                >
                  {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="text-[11px] hidden sm:inline">{isAutoPlaying ? 'Auto' : 'Paused'}</span>
                </button>
              )}

              {/* View Mode Toggle (Slider vs Grid) */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
                <button
                  onClick={() => setViewMode('slider')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'slider'
                      ? 'bg-teal-500 text-zinc-950 font-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Slider
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-teal-500 text-zinc-950 font-black shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Grid ({totalSlides})
                </button>
              </div>

              {/* Prev / Next Arrows */}
              {viewMode === 'slider' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevSlide}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-teal-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-md active:scale-95"
                    aria-label="Previous Project"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-teal-500 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer shadow-md active:scale-95"
                    aria-label="Next Project"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MODE 1: INTERACTIVE LIVELY SLIDER */}
          {viewMode === 'slider' && (
            <div
              className="relative overflow-hidden select-none"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(showcaseConfig.autoplay !== false)}
            >
              {/* Slider Main Frame with Dynamic Aspect Ratio (Default: 1:1 Square) */}
              <div className={`relative ${sliderContainerRatioClass} w-full rounded-3xl overflow-hidden glass-card border-2 border-teal-500/30 shadow-2xl bg-zinc-950`}>
                <AnimatePresence mode="wait">
                  {servicePortfolioProjects[slideIndex] && (
                    <motion.div
                      key={slideIndex}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.45, ease: 'easeInOut' }}
                      className="absolute inset-0 group cursor-pointer"
                      onClick={() => setLightboxIndex(slideIndex)}
                    >
                      {/* Full-bleed Clean Image */}
                      <img
                        src={servicePortfolioProjects[slideIndex].coverImage || FALLBACK_IMAGE}
                        alt={servicePortfolioProjects[slideIndex].title}
                        onError={(e) => {
                          e.target.src = FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Clean Frosted Floating Glass Overlay Bar */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-between p-4 sm:p-6">
                        {/* Top Bar: Slide Counter & Click to Zoom Badge */}
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-xs font-bold">
                            {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/90 text-zinc-950 font-bold text-xs shadow-lg group-hover:scale-105 transition-transform">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Click to Zoom HD</span>
                          </span>
                        </div>

                        {/* Bottom Bar: Title Only (Clean & Aesthetic) */}
                        <div className="space-y-1 max-w-xl">
                          <h3 className="text-base sm:text-xl font-bold font-display text-white tracking-tight drop-shadow-md line-clamp-2">
                            {servicePortfolioProjects[slideIndex].title}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Left & Right Clickable Arrow Touch Zones */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevSlide();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-teal-500 text-white hover:text-zinc-950 backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-xl z-20"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextSlide();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-teal-500 text-white hover:text-zinc-950 backdrop-blur-md border border-white/10 transition-all cursor-pointer shadow-xl z-20"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Interactive Thumbnail Carousel Strip (if enabled) */}
              {showcaseConfig.showThumbnails !== false && (
                <div className="flex items-center gap-2 sm:gap-3 pt-3 overflow-x-auto pb-1 no-scrollbar justify-center">
                  {servicePortfolioProjects.map((proj, idx) => {
                    const isActive = idx === slideIndex;
                    return (
                      <button
                        key={proj.id || idx}
                        onClick={() => setSlideIndex(idx)}
                        className={`relative rounded-xl overflow-hidden transition-all duration-300 shrink-0 cursor-pointer ${
                          isActive
                            ? 'w-16 sm:w-20 h-16 sm:h-20 ring-2 ring-teal-400 scale-105 shadow-lg shadow-teal-950/60'
                            : 'w-12 sm:w-16 h-12 sm:h-16 opacity-50 hover:opacity-90 hover:scale-100'
                        }`}
                      >
                        <img
                          src={proj.coverImage || FALLBACK_IMAGE}
                          alt=""
                          onError={(e) => {
                            e.target.src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MODE 2: CLEAN MINIMALIST GRID (with configured 1:1 ratio and grid columns) */}
          {viewMode === 'grid' && (
            <div className={`grid ${gridColsClass} gap-6`}>
              {servicePortfolioProjects.map((proj, idx) => (
                <div
                  key={proj.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`group rounded-3xl glass-card border border-zinc-800 hover:border-teal-500/50 transition-all duration-300 overflow-hidden relative cursor-pointer ${gridCardRatioClass} bg-zinc-900 shadow-xl`}
                >
                  {/* Clean Edge-to-Edge Image */}
                  <img
                    src={proj.coverImage || FALLBACK_IMAGE}
                    alt={proj.title}
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Clean Gradient Title Strip on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-5">
                    <div className="flex justify-end">
                      <span className="p-2 rounded-xl bg-teal-500 text-zinc-950 font-bold shadow-lg group-hover:scale-110 transition-transform">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm sm:text-base drop-shadow-md line-clamp-1">
                        {proj.title}
                      </h3>
                      <span className="text-[11px] text-teal-400 font-semibold block">
                        Click to view Full HD Preview →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            3. INTERACTIVE DELIVERABLES VISUAL EXPLORER
            ========================================================================= */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <Badge variant="brand" size="md">
              Guaranteed Deliverables
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
              Every Format & Asset You Receive
            </h2>
            <p className="text-xs text-zinc-400">
              High resolution, source vector files, and ready for commercial deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {deliverableItems.map((deliv, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl glass-card border border-zinc-800 hover:border-teal-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-teal-400">
                    {deliv.ext}
                  </span>
                </div>
                <h4 className="font-bold text-white text-sm sm:text-base">{deliv.name}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{deliv.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            4. PRICING PACKAGES (3 Tiers: Basic, Standard, Premium)
            ========================================================================= */}
        <div id="pricing-packages" className="space-y-8 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <Badge variant="brand" size="md">
              Transparent Pricing
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-white">
              Select Your Project Scope
            </h2>
            <p className="text-xs text-zinc-400">
              Select any package below to chat instantly on WhatsApp or book a discovery meeting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((pkg) => {
              let pkgFeatures = pkg.features;
              if (typeof pkgFeatures === 'string') {
                try {
                  pkgFeatures = JSON.parse(pkgFeatures);
                } catch (e) {
                  pkgFeatures = [];
                }
              }

              return (
                <motion.div
                  key={pkg.id}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.25 } }}
                  className={`p-6 sm:p-8 rounded-3xl flex flex-col justify-between relative transition-all duration-300 ${
                    pkg.isPopular
                      ? 'glass-card border-2 border-teal-400 shadow-2xl shadow-teal-950/60 bg-zinc-900/90'
                      : 'glass-card border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
                  }`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full bg-teal-500 text-zinc-950 font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 animate-pulse">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        Most Popular Choice
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold font-display text-white mb-1.5">{pkg.name}</h3>
                    <p className="text-xs text-zinc-400 mb-5 leading-relaxed min-h-[32px]">{pkg.description}</p>

                    <div className="mb-5 pb-5 border-b border-zinc-800">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black font-display text-white">{formatAmount(pkg.price)}</span>
                        <span className="text-xs text-zinc-400 font-medium">/{pkg.billingPeriod || 'project'}</span>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2.5 mb-6">
                      {Array.isArray(pkgFeatures) &&
                        pkgFeatures.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs text-zinc-300">
                            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feat}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenActionModal(pkg)}
                    className="w-full block cursor-pointer"
                  >
                    <Button
                      variant={pkg.isPopular ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full justify-center font-bold shadow-lg"
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      {pkg.ctaText || 'Select & Order Package'}
                    </Button>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            5. 5-STEP WORKFLOW METHODOLOGY
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55 }}
          className="p-6 sm:p-10 rounded-3xl glass-card border border-zinc-800 space-y-8"
        >
          <div className="text-center max-w-xl mx-auto space-y-1">
            <Badge variant="brand" size="md">
              Process
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
              How We Bring Your Vision to Life
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {processSteps.map((p, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, borderColor: 'rgba(20, 184, 166, 0.4)' }}
                className="space-y-2 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-display text-teal-400 font-mono">{p.step}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">{p.duration}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{p.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* =========================================================================
            6. SERVICE FAQS
            ========================================================================= */}
        <FaqAccordion faqs={faqs} />

        {/* =========================================================================
            7. FINAL CALL TO ACTION
            ========================================================================= */}
        <div className="p-8 sm:p-12 rounded-3xl glass-card border border-teal-500/30 text-center space-y-5 relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-teal-950/40">
          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
              Have Questions or Need a Custom Scope?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300">
              Connect directly with Sakhawat on WhatsApp or reserve a 30-minute discovery consultation.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => handleOpenActionModal(defaultPopularPkg)}
                className="cursor-pointer"
              >
                <Button variant="primary" size="lg" icon={MessageCircle}>
                  Chat on WhatsApp
                </Button>
              </button>
              <Link to="/book-a-meeting" state={{ serviceName: service.title }}>
                <Button variant="secondary" size="lg" icon={Calendar}>
                  Book a Meeting
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          8. STICKY FLOATING CONVERSION ACTION BAR (Appears on scroll)
          ========================================================================= */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 left-4 right-4 max-w-3xl mx-auto z-40 pointer-events-auto"
          >
            <div className="p-3 sm:p-4 rounded-2xl glass-card border-2 border-teal-500/50 bg-zinc-950/95 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                  <ServiceIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span>{service.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                      From {formatAmount(startingPrice)}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 hidden sm:block">
                    🔥 Limited client slots available this week
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenActionModal(defaultPopularPkg)}
                  className="cursor-pointer"
                >
                  <Button variant="primary" size="sm" icon={MessageCircle} className="text-xs">
                    Order via WhatsApp
                  </Button>
                </button>
                <Link to="/book-a-meeting" state={{ serviceName: service.title }}>
                  <Button variant="secondary" size="sm" icon={Calendar} className="text-xs">
                    Book Call
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          9. CINEMATIC LIGHTBOX GALLERY MODAL
          ========================================================================= */}
      <AnimatePresence>
        {currentLightboxProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl w-full max-h-[92vh] glass-card rounded-3xl overflow-hidden z-10 border-2 border-teal-500/40 p-4 bg-zinc-950 flex flex-col space-y-3"
            >
              {/* Lightbox Top Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest block">
                    Design {lightboxIndex + 1} of {totalSlides}
                  </span>
                  <h4 className="font-bold text-white text-base sm:text-lg">{currentLightboxProject.title}</h4>
                </div>
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lightbox Image / Video Preview Area with Next/Prev Arrows */}
              <div className="relative flex-1 min-h-[50vh] max-h-[68vh] overflow-hidden rounded-2xl bg-zinc-900/60 flex items-center justify-center p-2">
                {currentLightboxProject.liveUrl && currentLightboxProject.liveUrl.includes('youtu') ? (
                  (() => {
                    const isVertical =
                      currentLightboxProject.liveUrl.includes('shorts') ||
                      currentLightboxProject.liveUrl.includes('reel') ||
                      currentLightboxProject.category?.toLowerCase().includes('ugc') ||
                      currentLightboxProject.category?.toLowerCase().includes('video') ||
                      slug.includes('ugc') ||
                      slug.includes('video');

                    return (
                      <div
                        className={`overflow-hidden bg-black border-2 border-teal-500/50 shadow-2xl transition-all ${
                          isVertical
                            ? 'w-full max-w-[330px] sm:max-w-[350px] aspect-[9/16] max-h-[65vh] rounded-3xl'
                            : 'w-full aspect-video max-h-[65vh] rounded-2xl'
                        }`}
                      >
                        <iframe
                          src={
                            currentLightboxProject.liveUrl.includes('embed')
                              ? currentLightboxProject.liveUrl
                              : `https://www.youtube-nocookie.com/embed/${
                                  currentLightboxProject.liveUrl.match(/(?:youtu\.be\/|watch\?v=|\/embed\/|shorts\/)([\w-]{11})/)?.[1] || ''
                                }?autoplay=1&rel=0&modestbranding=1`
                          }
                          title={currentLightboxProject.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                    );
                  })()
                ) : (
                  <img
                    src={currentLightboxProject.coverImage || FALLBACK_IMAGE}
                    alt={currentLightboxProject.title}
                    onError={(e) => {
                      e.target.src = FALLBACK_IMAGE;
                    }}
                    className="max-h-[66vh] max-w-full w-auto object-contain rounded-xl shadow-2xl"
                  />
                )}

                {/* Lightbox Nav Arrows */}
                <button
                  onClick={() =>
                    setLightboxIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-teal-500 text-white hover:text-zinc-950 transition-all cursor-pointer shadow-lg"
                  aria-label="Previous Design"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) => (prev + 1) % totalSlides)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-teal-500 text-white hover:text-zinc-950 transition-all cursor-pointer shadow-lg"
                  aria-label="Next Design"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Lightbox Bottom Quick Order Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-zinc-800/80 text-xs">
                <span className="text-zinc-400">
                  Like this visual style? Request similar design deliverables for your brand.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setLightboxIndex(null);
                      handleOpenActionModal(defaultPopularPkg);
                    }}
                    className="cursor-pointer"
                  >
                    <Button variant="primary" size="sm" icon={MessageCircle} className="text-xs">
                      Order Design Like This
                    </Button>
                  </button>
                  <Link to="/book-a-meeting" state={{ serviceName: service.title }}>
                    <Button variant="secondary" size="sm" icon={Calendar} className="text-xs">
                      Book Call
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Package Action Modal (Instant WhatsApp vs Book Meeting) */}
      <PackageActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceName={service.title}
        pkg={modalPkg}
      />
    </div>
  );
};

export default ServiceDetailPage;
