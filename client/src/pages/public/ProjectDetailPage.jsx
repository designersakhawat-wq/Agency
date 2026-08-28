import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  Figma,
  Github,
  ExternalLink,
  Calendar,
  User,
  Tag,
  Sparkles,
  CheckCircle2,
  Layers,
  Wrench,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import Button from '../../components/common/Button';

import { DEFAULT_PROJECTS } from '../../data/defaultData';
import tracking from '../../services/trackingService';

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const defaultProject = DEFAULT_PROJECTS.find((p) => p.slug === slug || p.id === slug) || DEFAULT_PROJECTS[0];
  const [project, setProject] = useState(defaultProject);
  const [related, setRelated] = useState(() => DEFAULT_PROJECTS.filter((p) => p.slug !== slug));
  const [activeImage, setActiveImage] = useState(() => defaultProject?.coverImage || '');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/projects/${slug}`).catch(() => null);
        if (res && res.success && res.data?.project) {
          setProject(res.data.project);
          setActiveImage(res.data.project.coverImage);
          setRelated(res.data.relatedProjects || []);
          tracking.trackViewContent(res.data.project.title, 'Portfolio Case Study', null, 'USD', res.data.project.id);
        } else if (defaultProject) {
          tracking.trackViewContent(defaultProject.title, 'Portfolio Case Study', null, 'USD', defaultProject.id);
        }
      } catch (err) {
        console.error('Error fetching project detail:', err);
      }
    };
    fetchDetail();
  }, [slug]);

  if (!project && !defaultProject) return null;

  // Parse tags, tools & gallery
  const parseList = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val ? [val] : [];
      }
    }
    return [];
  };

  const tags = parseList(project.tags);
  const tools = parseList(project.tools);
  const gallery = parseList(project.galleryImages);

  const goalText = project.goal || project.challenges || '';
  const solutionText = project.solution || project.solutions || '';
  const impactText = project.results || '';

  return (
    <div className="pt-44 sm:pt-48 pb-24 min-h-screen relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="ambient-glow-teal top-20 right-1/4 opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Back Link */}
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to All Showcase Projects</span>
        </Link>

        {/* Project Header */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
              {project.category}
            </span>

            {project.service && (
              <Link
                to={`/services/${project.service.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>Service: {project.service.title}</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-500" />
              </Link>
            )}

            {project.featured && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                ⭐ Featured Case Study
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-tight">
            {project.title}
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 max-w-4xl leading-relaxed">
            {project.summary}
          </p>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Client / Brand
              </span>
              <span className="text-sm font-bold text-white">{project.client || 'Confidential Client'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Project Year
              </span>
              <span className="text-sm font-bold text-white">{project.year || '2025'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Category Scope
              </span>
              <span className="text-sm font-bold text-teal-400">{project.category}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                Creative Assets
              </span>
              <span className="text-sm font-bold text-white">Full Source + High-Res</span>
            </div>
          </div>

          {/* Action Links & External Showcases */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="md" icon={ExternalLink} iconPosition="right">
                  Launch Live Demo
                </Button>
              </a>
            )}
            {project.behanceUrl && (
              <a href={project.behanceUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md" icon={ExternalLink}>
                  Behance Showcase
                </Button>
              </a>
            )}
            {project.dribbbleUrl && (
              <a href={project.dribbbleUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="md" icon={ExternalLink}>
                  Dribbble Shot
                </Button>
              </a>
            )}
            {project.figmaUrl && (
              <a href={project.figmaUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="md" icon={Figma}>
                  Inspect Figma Source
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Hero Cover Image Display */}
        <div className="rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl aspect-[16/9]">
          <img
            src={activeImage || project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gallery Thumbnails */}
        {gallery.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Project Gallery & High-Res Screens ({gallery.length + 1})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[project.coverImage, ...gallery].map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`rounded-xl overflow-hidden aspect-[16/10] border-2 transition-all cursor-pointer ${
                    activeImage === imgUrl
                      ? 'border-teal-500 scale-105 shadow-lg shadow-teal-950/50'
                      : 'border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Structured Breakdown: Objective, Solution, Impact */}
        {(goalText || solutionText || impactText) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goalText && (
              <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  01. The Challenge
                </span>
                <h3 className="text-lg font-bold font-display text-white">Objective & Bottleneck</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{goalText}</p>
              </div>
            )}

            {solutionText && (
              <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  02. The Creative Strategy
                </span>
                <h3 className="text-lg font-bold font-display text-white">Design Execution</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{solutionText}</p>
              </div>
            )}

            {impactText && (
              <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  03. The Result
                </span>
                <h3 className="text-lg font-bold font-display text-white">Commercial Impact</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{impactText}</p>
              </div>
            )}
          </div>
        )}

        {/* Full In-Depth Narrative */}
        <div className="bg-zinc-900/60 rounded-3xl p-8 sm:p-12 border border-zinc-800 space-y-6">
          <h3 className="text-2xl font-bold font-display text-white">Case Study Breakdown</h3>
          <div className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {project.description}
          </div>

          {/* Tools & Tags */}
          <div className="pt-6 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            {tools.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-400 font-bold mr-1 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-teal-400" />
                  <span>Tools Used:</span>
                </span>
                {tools.map((tool, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-zinc-950 text-zinc-400 border border-zinc-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversion CTA Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-teal-950/80 via-zinc-900 to-zinc-950 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Need Similar Results For Your Brand?
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Let's Build Your Next High-Impact Design
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300">
              Lock in a custom project quote with fast 24–48h delivery, source files, and unlimited revisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link to="/book-a-meeting">
              <Button variant="primary" size="md" icon={Calendar}>
                Book a Free Discovery Call
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="md" icon={MessageSquare}>
                Send Inquiry
              </Button>
            </Link>
          </div>
        </div>

        {/* Related Projects */}
        {related.length > 0 && (
          <div className="pt-8 border-t border-zinc-800 space-y-6">
            <h3 className="text-2xl font-bold font-display text-white">
              More {project.category} Projects
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.slice(0, 3).map((rel) => (
                <Link
                  key={rel.id}
                  to={`/portfolio/${rel.slug}`}
                  className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-teal-500/40 transition-all group"
                >
                  <div className="rounded-xl overflow-hidden aspect-[16/10] bg-zinc-950 mb-3">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">
                    {rel.category}
                  </span>
                  <h4 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors truncate">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{rel.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
