import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Eye,
  MessageCircle,
  X,
  Play,
  Pause,
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

// Safe Image Component (Zero broken images, elegant shimmer)
const SafeImage = ({ src, alt, category }) => {
  const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default;
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950 select-none pointer-events-none">
      {!loaded && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={alt || 'Design Craft'}
        onLoad={() => setLoaded(true)}
        onError={() => setImgSrc(fallback)}
        className={`w-full h-full object-cover transition-all duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading="lazy"
        draggable="false"
      />
    </div>
  );
};

export const FeaturedProjects = ({ projects = [], onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [quickModalProject, setQuickModalProject] = useState(null);

  // Consolidated & normalized projects list
  const allProjects = useMemo(() => {
    const list = Array.isArray(projects) && projects.length > 0 ? projects : DEFAULT_PROJECTS;
    return list.map((p, idx) => ({
      ...p,
      id: p.id || `proj-${idx}`,
      title: p.title || 'Creative Showcase',
      category: p.category || 'Brand Identity',
      summary: p.summary || p.description || 'High-converting design craft engineered for brand elevation.',
      coverImage: p.coverImage || CATEGORY_FALLBACKS[p.category] || CATEGORY_FALLBACKS.default,
      client: p.client || 'Client Project',
      year: p.year || '2025',
    }));
  }, [projects]);

  const categories = ['All', 'Logo & Branding', 'Ads Creative', 'Cover Branding', 'E-Commerce', 'UGC Video'];

  // Filtered list based on active category tab
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

  const totalItems = filteredProjects.length;

  // Auto-scroll Timer (transitions smoothly every 3.5s)
  useEffect(() => {
    if (!isAutoPlaying || totalItems <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAutoPlaying, totalItems]);

  // Reset index when category tab changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const handleCardClick = (index, project) => {
    if (index === currentIndex) {
      setQuickModalProject(project);
      tracking.trackViewContent(project.title, 'Featured Gallery Focal Look', null, 'USD', project.id);
      if (onSelectProject) onSelectProject(project);
    } else {
      setCurrentIndex(index);
    }
  };

  const handleWhatsApp = (project) => {
    tracking.trackWhatsAppClick(
      'Featured Visual Gallery',
      `Similar Project: ${project.title}`,
      `Client inquiry for ${project.title}`
    );
    const msg = encodeURIComponent(
      `Hi Sakhawat! 👋\n\nI saw your featured work for *${project.title}* on your website and would like to discuss a similar design project for my brand. Are you available?`
    );
    window.open(`https://wa.me/8801781955355?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="portfolio-section"
      className="py-20 sm:py-28 relative overflow-hidden bg-[#060608]"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background Radial Glow */}
      <div className="ambient-glow-teal top-1/2 -left-40 opacity-20 pointer-events-none" />
      <div className="ambient-glow-cyan top-1/2 -right-40 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* ========================================================================= */}
        {/* 1. HEADER MATCHING REFERENCE (CENTERED, CLEAN & MINIMAL)                   */}
        {/* ========================================================================= */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-bold tracking-[0.25em] text-teal-400 uppercase">
            SELECTED WORKS
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Featured Visual Gallery
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            A curated showcase of high-converting visual creatives, brand identities, and performance marketing designs.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. PILL FILTER TABS (MATCHING REFERENCE EXACTLY)                          */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-teal-400 text-zinc-950 font-black shadow-lg shadow-teal-500/25 scale-105'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            );
          })}

          <Link
            to="/portfolio"
            className="px-4 sm:px-5 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3 h-3 text-teal-400" />
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 3. 3D COVERFLOW / FOCAL IMAGE CAROUSEL (MATCHING REFERENCE)               */}
        {/* ========================================================================= */}
        <div className="relative h-[380px] sm:h-[460px] md:h-[520px] lg:h-[560px] flex items-center justify-center overflow-hidden my-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {filteredProjects.map((project, idx) => {
              // Calculate relative distance from current active index
              let offset = (idx - currentIndex + totalItems) % totalItems;
              if (offset > totalItems / 2) offset -= totalItems;

              // Show active item and 2 adjacent items on left and right
              const isVisible = Math.abs(offset) <= 2;
              if (!isVisible) return null;

              const isCenter = offset === 0;

              // Compute transforms for 3D depth and overlap
              let xOffset = 0;
              let scale = 1;
              let zIndex = 20;
              let opacity = 1;
              let rotateY = 0;

              if (isCenter) {
                xOffset = 0;
                scale = 1.12;
                zIndex = 30;
                opacity = 1;
                rotateY = 0;
              } else if (offset === 1) {
                xOffset = 260; // Shift right
                scale = 0.88;
                zIndex = 20;
                opacity = 0.85;
                rotateY = -6;
              } else if (offset === -1) {
                xOffset = -260; // Shift left
                scale = 0.88;
                zIndex = 20;
                opacity = 0.85;
                rotateY = 6;
              } else if (offset === 2) {
                xOffset = 460;
                scale = 0.72;
                zIndex = 10;
                opacity = 0.4;
                rotateY = -12;
              } else if (offset === -2) {
                xOffset = -460;
                scale = 0.72;
                zIndex = 10;
                opacity = 0.4;
                rotateY = 12;
              }

              return (
                <motion.div
                  key={project.id}
                  onClick={() => handleCardClick(idx, project)}
                  className="absolute cursor-pointer transition-shadow"
                  animate={{
                    x: xOffset,
                    scale: scale,
                    zIndex: zIndex,
                    opacity: opacity,
                    rotateY: rotateY,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 26,
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    className={`relative w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px] aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-950 border transition-all duration-500 shadow-2xl ${
                      isCenter
                        ? 'border-teal-500/60 shadow-2xl shadow-teal-950/80 ring-2 ring-teal-500/20'
                        : 'border-zinc-800/80 shadow-black/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Pure High-Res Visual Image */}
                    <SafeImage
                      src={project.coverImage}
                      alt={project.title}
                      category={project.category}
                    />

                    {/* Subtle bottom gradient on active card with title */}
                    {isCenter && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-between p-5 sm:p-6">
                        {/* Category Tag Top Left */}
                        <div className="flex items-center justify-between">
                          <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-teal-300 text-xs font-bold shadow-md">
                            {project.category}
                          </span>

                          <span className="w-8 h-8 rounded-full bg-zinc-900/90 border border-white/20 text-white flex items-center justify-center shadow-lg">
                            <Eye className="w-3.5 h-3.5 text-teal-400" />
                          </span>
                        </div>

                        {/* Title & Client at Bottom */}
                        <div className="space-y-1">
                          <span className="text-[11px] text-zinc-400 font-mono block">
                            {project.client} • {project.year}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold font-display text-white line-clamp-1">
                            {project.title}
                          </h3>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CIRCULAR NAVIGATION ARROWS BELOW (MATCHING REFERENCE EXACTLY)           */}
        {/* ========================================================================= */}
        <div className="flex flex-col items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous Project"
              className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-teal-500 hover:text-black border border-zinc-700 text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Slide Index Dot Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800">
              {filteredProjects.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIndex(dotIdx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    dotIdx === currentIndex ? 'w-5 bg-teal-400' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              aria-label="Next Project"
              className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-teal-500 hover:text-black border border-zinc-700 text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hover:scale-105"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE CASE STUDY QUICK MODAL                                     */}
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
              className="relative w-full max-w-2xl rounded-3xl glass-card border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden max-h-[88vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setQuickModalProject(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1.5 pr-8">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                  {quickModalProject.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
                  {quickModalProject.title}
                </h3>
                <span className="text-xs text-zinc-500 block font-mono">
                  Client: {quickModalProject.client} • Year: {quickModalProject.year}
                </span>
              </div>

              {/* Image Preview */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-xl">
                <SafeImage
                  src={quickModalProject.coverImage}
                  alt={quickModalProject.title}
                  category={quickModalProject.category}
                />
              </div>

              {/* Summary */}
              <p className="text-sm text-zinc-300 leading-relaxed">
                {quickModalProject.summary}
              </p>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => {
                    handleWhatsApp(quickModalProject);
                    setQuickModalProject(null);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Inquire on WhatsApp</span>
                </button>

                <Link
                  to={`/portfolio/${quickModalProject.slug}`}
                  onClick={() => setQuickModalProject(null)}
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
