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
  ExternalLink,
} from 'lucide-react';
import Button from '../common/Button';
import { DEFAULT_PROJECTS } from '../../data/defaultData';
import tracking from '../../services/trackingService';

// Curated Category Fallback Images (Using user's real uploaded media assets)
const CATEGORY_FALLBACKS = {
  'Logo & Branding': '/uploads/edtech-social-media-post-design--9--1787766737628-820411568.jpg',
  'Brand Identity': '/uploads/edtech-social-media-post-design--9--1787766737628-820411568.jpg',
  'Ads Creative': '/uploads/amazon-listing-images-electric-shaver-hero--1--1787766545048-828073166.jpg',
  'Social Media Ads': '/uploads/amazon-listing-images-electric-shaver-hero--1--1787766545048-828073166.jpg',
  'E-commerce': '/uploads/9062-laptop-mockup-v2-1787833949708-949730261.jpg',
  'UGC Video': '/uploads/logo-new-01-01-1787835006263-396457564.jpg',
  'Cover Branding': '/uploads/cover-photo-1787764748710-758629908.jpg',
  default: '/uploads/amazon-listing-images-electric-shaver-hero--1--1787766545048-828073166.jpg',
};

// Rock-solid Safe Image (Never pitch black, instant fallback)
const SafeImage = ({ src, alt, category }) => {
  const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default;
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  useEffect(() => {
    setCurrentSrc(src || fallback);
  }, [src, fallback]);

  return (
    <div className="w-full h-full aspect-square bg-zinc-900 overflow-hidden select-none pointer-events-none relative">
      <img
        src={currentSrc}
        alt={alt || 'Creative Work'}
        onError={() => {
          if (currentSrc !== fallback) setCurrentSrc(fallback);
        }}
        className="w-full h-full aspect-square object-cover select-none"
        draggable="false"
      />
    </div>
  );
};

export const FeaturedProjects = ({ projects = [] }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quickModalProject, setQuickModalProject] = useState(null);

  // Normalize project list - prioritize explicitly featured projects
  const allProjects = useMemo(() => {
    const list = Array.isArray(projects) && projects.length > 0 ? projects : DEFAULT_PROJECTS;
    // Check if there are any explicitly featured projects
    const explicitFeatured = list.filter((p) => p.featured === true || p.featured === 'true');
    const displayList = explicitFeatured.length > 0 ? explicitFeatured : list;

    return displayList.map((p, idx) => ({
      ...p,
      id: p.id || `proj-${idx}`,
      title: p.title || 'Creative Showcase',
      category: p.category || 'Brand Identity',
      summary: p.summary || p.description || 'High-converting visual craft designed to elevate brand authority.',
      coverImage: p.coverImage || CATEGORY_FALLBACKS[p.category] || CATEGORY_FALLBACKS.default,
      client: p.client || 'Client Brand',
      year: p.year || '2024',
    }));
  }, [projects]);

  const categories = ['All', 'Logo & Branding', 'Ads Creative', 'Cover Branding', 'E-Commerce', 'UGC Video'];

  // Filtered by category
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

  // Continuous Non-Stop Smooth Autoplay timer (2.2s interval)
  // Only pauses while viewing the 1:1 image modal, resumes immediately on close
  useEffect(() => {
    if (quickModalProject || totalItems <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, 2200);
    return () => clearInterval(timer);
  }, [quickModalProject, totalItems]);

  // Reset index when filter changes
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
    setCurrentIndex(index);
    setQuickModalProject(project);
    tracking.trackViewContent(project.title, 'Featured Gallery Focal Look', null, 'USD', project.id);
  };

  const handleWhatsApp = (project) => {
    tracking.trackWhatsAppClick(
      'Featured Visual Gallery',
      `Project Inquiry: ${project.title}`,
      `Client interested in ${project.title}`
    );
    const msg = encodeURIComponent(
      `Hi Sakhawat! 👋\n\nI saw your featured work for *${project.title}* on your website and would like to discuss a similar project for my brand. Are you available?`
    );
    window.open(`https://wa.me/8801781955355?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="portfolio-section"
      className="py-20 sm:py-28 relative overflow-hidden transition-colors duration-300"
    >
      {/* Ambient background glows */}
      <div className="ambient-glow-teal top-1/2 -left-40 opacity-20 pointer-events-none" />
      <div className="ambient-glow-cyan top-1/2 -right-40 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* ========================================================================= */}
        {/* 1. HEADER                                                                 */}
        {/* ========================================================================= */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold tracking-[0.2em] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>SELECTED WORKS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
            Featured Visual Gallery
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400">
            A curated showcase of high-converting visual creatives, brand identities, and performance marketing designs.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. PILL FILTER TABS                                                       */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
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
        {/* 3. FLUID 3D KINETIC COVERFLOW TRACK                                       */}
        {/* ========================================================================= */}
        <div className="relative h-[440px] sm:h-[500px] md:h-[560px] lg:h-[600px] flex items-center justify-center overflow-x-clip overflow-y-visible my-2 py-4">
          <div className="relative w-full h-full flex items-center justify-center">
            {filteredProjects.map((project, idx) => {
              // Calculate relative offset from currentIndex
              let offset = (idx - currentIndex + totalItems) % totalItems;
              if (offset > totalItems / 2) offset -= totalItems;

              // Show active card and 2 adjacent cards on each side
              const isVisible = Math.abs(offset) <= 2;
              if (!isVisible) return null;

              const isCenter = offset === 0;

              // Positioning and 3D depth parameters
              let xOffset = 0;
              let scale = 1;
              let zIndex = 20;
              let opacity = 1;
              let rotateY = 0;

              if (isCenter) {
                xOffset = 0;
                scale = 1.14;
                zIndex = 30;
                opacity = 1;
                rotateY = 0;
              } else if (offset === 1) {
                xOffset = 270;
                scale = 0.88;
                zIndex = 20;
                opacity = 0.85;
                rotateY = -8;
              } else if (offset === -1) {
                xOffset = -270;
                scale = 0.88;
                zIndex = 20;
                opacity = 0.85;
                rotateY = 8;
              } else if (offset === 2) {
                xOffset = 470;
                scale = 0.72;
                zIndex = 10;
                opacity = 0.35;
                rotateY = -15;
              } else if (offset === -2) {
                xOffset = -470;
                scale = 0.72;
                zIndex = 10;
                opacity = 0.35;
                rotateY = 15;
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
                    stiffness: 240,
                    damping: 24,
                    mass: 0.8,
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    className={`relative w-[260px] sm:w-[320px] md:w-[380px] lg:w-[420px] aspect-square rounded-[2rem] overflow-hidden bg-zinc-950 border transition-all duration-300 shadow-2xl ${
                      isCenter
                        ? 'border-teal-400 shadow-2xl shadow-teal-950/80 ring-2 ring-teal-400/30'
                        : 'border-zinc-800 shadow-black hover:border-zinc-700'
                    }`}
                  >
                    {/* Visual Image */}
                    <SafeImage
                      src={project.coverImage}
                      alt={project.title}
                      category={project.category}
                    />

                    {/* Top Clean Floating Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10 pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[11px] font-semibold shadow-md pointer-events-auto">
                        {project.category}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickModalProject(project);
                        }}
                        aria-label="View 1:1 Image Preview"
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center shadow-lg hover:scale-110 hover:bg-teal-500 hover:text-zinc-950 transition-all cursor-pointer pointer-events-auto"
                      >
                        <Eye className="w-4 h-4 text-teal-300 group-hover:text-zinc-950" />
                      </button>
                    </div>

                    {/* Clean Minimal Title Bar on Hover / Active */}
                    <div
                      className={`absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-black/75 to-transparent transition-opacity duration-300 ${
                        isCenter ? 'opacity-90 hover:opacity-100' : 'opacity-0 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-bold font-display text-white truncate drop-shadow-md">
                          {project.title}
                        </h3>
                        {project.client && (
                          <span className="text-[10px] text-teal-300 font-mono font-semibold shrink-0">
                            {project.client}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CLEAN CIRCULAR NAVIGATION ARROWS                                       */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handlePrev}
            aria-label="Previous Project"
            className="w-11 h-11 rounded-full bg-zinc-900/90 hover:bg-teal-400 hover:text-zinc-950 border border-zinc-800 text-zinc-300 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Project"
            className="w-11 h-11 rounded-full bg-zinc-900/90 hover:bg-teal-400 hover:text-zinc-950 border border-zinc-800 text-zinc-300 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg hover:scale-105"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. ULTRA-CLEAN 1:1 PURE IMAGE LIGHTBOX MODAL                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {quickModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickModalProject(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
            />

            {/* Pure 1:1 Image Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-[90vw] sm:max-w-[540px] md:max-w-[620px] aspect-square rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl z-10"
            >
              {/* Clean Close Button */}
              <button
                onClick={() => setQuickModalProject(null)}
                aria-label="Close Preview"
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Pure 1:1 Image */}
              <SafeImage
                src={quickModalProject.coverImage}
                alt={quickModalProject.title}
                category={quickModalProject.category}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedProjects;
