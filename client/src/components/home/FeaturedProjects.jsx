import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Eye,
  Sparkles,
  MessageCircle,
  X,
} from 'lucide-react';
import Button from '../common/Button';
import { DEFAULT_PROJECTS } from '../../data/defaultData';
import tracking from '../../services/trackingService';

// Curated Category Fallback Images
const CATEGORY_FALLBACKS = {
  'Logo & Branding': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&auto=format&fit=crop&q=80',
  'Brand Identity': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&auto=format&fit=crop&q=80',
  'Ads Creative': 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
  'Social Media Ads': 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
  'E-commerce': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80',
  'UGC Video': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
  'Cover Branding': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=80',
};

// Safe Image Component
const SafeCardImage = ({ src, alt, category }) => {
  const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default;
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-900">
      {!loaded && (
        <div className="absolute inset-0 bg-zinc-800/60 animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={alt || 'Project Preview'}
        onLoad={() => setLoaded(true)}
        onError={() => setImgSrc(fallback)}
        className={`w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-108 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
      />
    </div>
  );
};

export const FeaturedProjects = ({ projects = [], onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [modalProject, setModalProject] = useState(null);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Normalize project data
  const allProjects = useMemo(() => {
    const list = Array.isArray(projects) && projects.length > 0 ? projects : DEFAULT_PROJECTS;
    return list.map((p, idx) => ({
      ...p,
      id: p.id || `proj-${idx}`,
      title: p.title || 'Creative Project',
      category: p.category || 'Brand Identity',
      summary: p.summary || p.description || 'High-impact visual creative engineered for brand growth.',
      coverImage: p.coverImage || CATEGORY_FALLBACKS[p.category] || CATEGORY_FALLBACKS.default,
      client: p.client || 'Agency Client',
      year: p.year || '2025',
    }));
  }, [projects]);

  const categories = ['All', 'Logo & Branding', 'Ads Creative', 'Cover Branding', 'E-Commerce', 'UGC Video'];

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return allProjects;
    const target = activeCategory.toLowerCase();
    return allProjects.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      if (target.includes('brand') || target.includes('logo')) {
        return cat.includes('brand') || cat.includes('logo');
      }
      if (target.includes('ads')) {
        return cat.includes('ad');
      }
      if (target.includes('cover')) {
        return cat.includes('cover') || cat.includes('banner');
      }
      if (target.includes('video') || target.includes('ugc')) {
        return cat.includes('video') || cat.includes('ugc');
      }
      if (target.includes('commerce')) {
        return cat.includes('commerce') || cat.includes('shop');
      }
      return cat.includes(target);
    });
  }, [allProjects, activeCategory]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      const total = scrollWidth - clientWidth;
      setScrollProgress(total > 0 ? (scrollLeft / total) * 100 : 0);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [filteredProjects]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth > 768 ? 480 : 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleOpenModal = (project) => {
    setModalProject(project);
    tracking.trackViewContent(project.title, 'Portfolio Quick Look', null, 'USD', project.id);
    if (onSelectProject) onSelectProject(project);
  };

  const handleWhatsApp = (project) => {
    tracking.trackWhatsAppClick(
      'Featured Projects Showcase',
      `Similar Project: ${project.title}`,
      `Client interested in ${project.title}`
    );
    const msg = encodeURIComponent(
      `Hi Sakhawat! 👋\n\nI saw your work for *${project.title}* on your website and would like to discuss a similar project. Are you available?`
    );
    window.open(`https://wa.me/8801781955355?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="portfolio-section" className="py-20 sm:py-28 relative overflow-hidden bg-[#070709]">
      {/* Subtle Background Glow */}
      <div className="ambient-glow-teal top-1/2 -left-40 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* ========================================================================= */}
        {/* 1. CLEAN MODERN HEADER WITH CONTROLS                                       */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Selected Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight">
              Featured Work
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
              Swipe or scroll to explore curated design projects and high-converting marketing assets.
            </p>
          </div>

          {/* Right Action Area: Categories & Slider Arrows */}
          <div className="flex items-center gap-4">
            {/* Scroll Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll previous projects"
                className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  canScrollLeft
                    ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-teal-500 hover:text-black hover:border-teal-400 shadow-md'
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll next projects"
                className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  canScrollRight
                    ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-teal-500 hover:text-black hover:border-teal-400 shadow-md'
                    : 'bg-zinc-900/40 border-zinc-800/60 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <Link to="/portfolio" className="hidden sm:inline-block">
              <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="right">
                All Works ({allProjects.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MINIMALIST FILTER TABS                                                 */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md shadow-white/10'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HORIZONTAL DRAGGABLE SMOOTH-SCROLL SHOWCASE TRACK                      */}
      {/* ========================================================================= */}
      <div className="relative mt-6">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-8 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.2) }}
              onClick={() => handleOpenModal(project)}
              className="group relative w-[300px] sm:w-[400px] md:w-[460px] lg:w-[500px] aspect-[16/11] shrink-0 snap-start rounded-3xl overflow-hidden border border-zinc-800/90 hover:border-teal-500/50 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-teal-950/40 bg-zinc-950 flex flex-col justify-end cursor-pointer"
            >
              {/* Full-Bleed Image */}
              <div className="absolute inset-0 z-0">
                <SafeCardImage
                  src={project.coverImage}
                  alt={project.title}
                  category={project.category}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 opacity-70 group-hover:opacity-50 transition-opacity duration-500" />
              </div>

              {/* Top Category Tag */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium shadow-sm">
                  {project.category}
                </span>
              </div>

              {/* Quick View Button Top Right */}
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-9 h-9 rounded-full bg-zinc-900/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Eye className="w-4 h-4 text-teal-400" />
                </div>
              </div>

              {/* Floating Glassmorphic Bottom Pill */}
              <div className="relative z-10 p-4 m-3 sm:m-4 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-white/10 group-hover:border-teal-500/30 transition-all duration-300 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span>{project.client}</span>
                      <span>•</span>
                      <span>{project.year}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                      {project.title}
                    </h3>
                  </div>

                  {/* Circular Arrow Button */}
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 group-hover:bg-teal-500 group-hover:text-black flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Minimal Scroll Progress Indicator */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
              style={{ width: `${Math.max(scrollProgress, 15)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CLEAN QUICK CASE STUDY MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {modalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalProject(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-2xl rounded-3xl glass-card border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl z-10 space-y-5 overflow-hidden max-h-[88vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalProject(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 pr-8">
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">
                  {modalProject.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {modalProject.title}
                </h3>
                <span className="text-xs text-zinc-500 block">
                  {modalProject.client} • {modalProject.year}
                </span>
              </div>

              {/* Image Preview */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <SafeCardImage
                  src={modalProject.coverImage}
                  alt={modalProject.title}
                  category={modalProject.category}
                />
              </div>

              {/* Summary */}
              <p className="text-sm text-zinc-300 leading-relaxed">
                {modalProject.summary}
              </p>

              {/* Actions */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    handleWhatsApp(modalProject);
                    setModalProject(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Inquire on WhatsApp</span>
                </button>

                <Link
                  to={`/portfolio/${modalProject.slug}`}
                  onClick={() => setModalProject(null)}
                  className="w-full sm:w-auto"
                >
                  <Button variant="primary" size="md" icon={ArrowUpRight} iconPosition="right" className="w-full justify-center">
                    Read Case Study
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedProjects;
