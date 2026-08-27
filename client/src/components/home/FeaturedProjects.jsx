import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Figma, Eye, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import { Badge } from '../common/Badge';

import { DEFAULT_PROJECTS } from '../../data/defaultData';

export const FeaturedProjects = ({ projects = [], onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    'All',
    'Brand Identity',
    'Social Media Ads',
    'Banner Design',
    'E-Commerce',
    'Print Design',
  ];

  const sourceProjects = Array.isArray(projects) && projects.length > 0 ? projects : DEFAULT_PROJECTS;

  const filteredProjects =
    activeCategory === 'All'
      ? sourceProjects
      : sourceProjects.filter((p) => {
          const cat = (p.category || '').toLowerCase();
          const target = activeCategory.toLowerCase();
          return cat.includes(target) || target.includes(cat) || (p.tags && String(p.tags).toLowerCase().includes(target));
        });

  const finalProjects = filteredProjects.length > 0 ? filteredProjects : sourceProjects;

  return (
    <section id="portfolio-section" className="py-24 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="ambient-glow-teal top-1/3 -left-32 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Selected Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
              Featured Design Craft & Case Studies
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl">
              High-converting visual creatives, cohesive brand systems, and performance marketing designs built to generate real results.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/portfolio">
              <Button variant="outline" size="sm" icon={ArrowUpRight} iconPosition="right">
                View All Works ({projects.length})
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Category Filter Pills with Animated Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFilterPill"
                    className="absolute inset-0 rounded-xl bg-teal-600 shadow-lg shadow-teal-950/50 border border-teal-400/30 -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {finalProjects.map((project, idx) => {
              let parsedTags = [];
              if (Array.isArray(project.tags)) {
                parsedTags = project.tags;
              } else if (typeof project.tags === 'string') {
                try {
                  parsedTags = JSON.parse(project.tags);
                } catch (e) {
                  parsedTags = [];
                }
              }

              return (
                <motion.div
                  key={project.id || idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group rounded-2xl glass-card overflow-hidden border border-zinc-800/80 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-950/30 transition-all duration-300 flex flex-col card-shine"
                >
                  {/* Image Container with Smooth Hover Scale & Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-108"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-80" />

                    {/* Category & Featured Badge */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <Badge variant="brand" size="sm">
                        {project.category}
                      </Badge>
                      {project.featured && (
                        <Badge variant="amber" size="sm">
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Quick Action Overlays on Image */}
                    <div className="absolute bottom-3.5 right-3.5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 transform">
                      {project.figmaUrl && (
                        <a
                          href={project.figmaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-700/60 backdrop-blur-md hover:scale-110 transition-all"
                          title="View Figma"
                        >
                          <Figma className="w-4 h-4" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-zinc-900/90 text-zinc-300 hover:text-white border border-zinc-700/60 backdrop-blur-md hover:scale-110 transition-all"
                          title="Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                        <span>{project.client || 'Agency Client'}</span>
                        <span>{project.year || '2025'}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold font-display text-white group-hover:text-teal-300 transition-colors leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                        {project.summary}
                      </p>
                    </div>

                    {/* Tags */}
                    {parsedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {parsedTags.slice(0, 4).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900/90 text-zinc-400 border border-zinc-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Link to Detail Page */}
                    <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between">
                      <Link
                        to={`/portfolio/${project.slug}`}
                        className="text-xs font-semibold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1.5 group/link"
                      >
                        <span>View Project</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </Link>

                      <button
                        onClick={() => onSelectProject && onSelectProject(project)}
                        className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1 p-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick Look</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Multi-Service Connective Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Looking for works in a specific format?</h4>
              <p className="text-xs text-zinc-400">Jump directly into any service's full slider showcase on the Portfolio page.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to="/portfolio#logo-branding"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-teal-500/10 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 hover:border-teal-500/40 transition-colors"
            >
              🎨 Logo Branding
            </Link>
            <Link
              to="/portfolio#ads-creative"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-teal-500/10 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 hover:border-teal-500/40 transition-colors"
            >
              ⚡ Ads Creative
            </Link>
            <Link
              to="/portfolio#ugc-video"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-teal-500/10 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 hover:border-teal-500/40 transition-colors"
            >
              🎬 UGC Video
            </Link>
            <Link
              to="/portfolio#cover-branding"
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-teal-500/10 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800 hover:border-teal-500/40 transition-colors"
            >
              🖼️ Cover Branding
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
