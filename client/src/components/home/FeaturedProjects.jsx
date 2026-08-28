import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
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

// Safe Image Component (Zero broken images, smooth fade-in)
const SafeCardImage = ({ src, alt, category }) => {
  const fallback = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default;
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [loaded, setLoaded] = useState(false);

  React.useEffect(() => {
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
        className={`w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-105 ${
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

  // Normalize project data
  const allProjects = useMemo(() => {
    const list = Array.isArray(projects) && projects.length > 0 ? projects : DEFAULT_PROJECTS;
    return list.map((p, idx) => ({
      ...p,
      id: p.id || `proj-${idx}`,
      title: p.title || 'Creative Project',
      category: p.category || 'Brand Identity',
      summary: p.summary || p.description || 'High-impact design engineered for brand growth.',
      coverImage: p.coverImage || CATEGORY_FALLBACKS[p.category] || CATEGORY_FALLBACKS.default,
      client: p.client || 'Client Project',
      year: p.year || '2025',
    }));
  }, [projects]);

  // Clean, consolidated category filters
  const categories = ['All', 'Logo & Branding', 'Ads Creative', 'Cover Branding', 'E-Commerce', 'UGC Video'];

  // Filter logic
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
    <section id="portfolio-section" className="py-20 sm:py-24 relative overflow-hidden bg-[#070709]">
      {/* Subtle Background Glow */}
      <div className="ambient-glow-teal top-1/3 -left-32 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* ========================================================================= */}
        {/* 1. CLEAN, MODERN SECTION HEADER                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Selected Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight">
              Featured Design Craft
            </h2>
            <p className="text-sm sm:text-base text-zinc-400">
              High-converting visual creatives, cohesive brand systems, and performance marketing designs.
            </p>
          </div>

          <Link to="/portfolio" className="shrink-0">
            <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="right">
              View All Works ({allProjects.length})
            </Button>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 2. MINIMALIST FILTER TABS                                                 */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterPill"
                    className="absolute inset-0 rounded-xl bg-teal-400 shadow-md shadow-teal-500/20 -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 3. CLEAN & ELEGANT 3-COLUMN PROJECT GRID                                   */}
        {/* ========================================================================= */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id || idx}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.2) }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group rounded-2xl glass-card overflow-hidden border border-zinc-800/80 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-950/30 transition-all duration-300 flex flex-col bg-zinc-950/70"
              >
                {/* Image Container */}
                <div
                  onClick={() => handleOpenModal(project)}
                  className="relative aspect-[16/10] overflow-hidden bg-zinc-900 cursor-pointer"
                >
                  <SafeCardImage
                    src={project.coverImage}
                    alt={project.title}
                    category={project.category}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Category Pill on Image */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium shadow-sm">
                      {project.category}
                    </span>
                  </div>

                  {/* Quick Look Prompt on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                    <span className="px-3.5 py-1.5 rounded-xl bg-zinc-950/90 text-white border border-teal-400/40 text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                      <span>Quick Preview</span>
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{project.client}</span>
                      <span>{project.year}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-display text-white group-hover:text-teal-300 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {project.summary}
                    </p>
                  </div>

                  {/* Card Bottom Links */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <Link
                      to={`/portfolio/${project.slug}`}
                      className="text-xs font-semibold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 group/link"
                    >
                      <span>View Case Study</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>

                    <button
                      onClick={() => handleOpenModal(project)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Quick Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CLEAN QUICK LOOK MODAL                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {modalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalProject(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-2xl rounded-2xl glass-card border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl z-10 space-y-5 overflow-hidden max-h-[88vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setModalProject(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
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
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Inquire on WhatsApp</span>
                </button>

                <Link
                  to={`/portfolio/${modalProject.slug}`}
                  onClick={() => setModalProject(null)}
                  className="w-full sm:w-auto"
                >
                  <Button variant="primary" size="sm" icon={ArrowUpRight} iconPosition="right" className="w-full justify-center">
                    Full Case Study
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
