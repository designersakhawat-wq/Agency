import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Figma, Github, ExternalLink, Calendar, User, Tag, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import Button from '../../components/common/Button';

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await api.get(`/projects/${slug}`);
        if (res.success && res.data?.project) {
          setProject(res.data.project);
          setActiveImage(res.data.project.coverImage);
          setRelated(res.data.relatedProjects || []);
        } else {
          navigate('/portfolio');
        }
      } catch (err) {
        console.error('Error fetching project detail:', err);
        navigate('/portfolio');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen">
        <Loader message="Loading case study details..." fullScreen />
      </div>
    );
  }

  if (!project) return null;

  // Parse tags & gallery
  let tags = [];
  if (Array.isArray(project.tags)) tags = project.tags;
  else if (typeof project.tags === 'string') {
    try {
      tags = JSON.parse(project.tags);
    } catch (e) {
      tags = [];
    }
  }

  let gallery = [];
  if (Array.isArray(project.galleryImages)) gallery = project.galleryImages;
  else if (typeof project.galleryImages === 'string') {
    try {
      gallery = JSON.parse(project.galleryImages);
    } catch (e) {
      gallery = [];
    }
  }

  return (
    <div className="pt-32 pb-24 min-h-screen relative">
      <div className="ambient-glow-indigo top-20 right-1/4 opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Link */}
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Portfolio</span>
        </Link>

        {/* Project Header */}
        <div className="space-y-6 mb-12">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="brand" size="md">
              {project.category}
            </Badge>
            {project.featured && (
              <Badge variant="amber" size="md">
                Featured Case Study
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-tight">
            {project.title}
          </h1>

          <p className="text-base sm:text-xl text-zinc-300 max-w-4xl leading-relaxed">
            {project.summary}
          </p>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl glass-card border border-zinc-800">
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                Client / Company
              </span>
              <span className="text-sm font-bold text-white">{project.client || 'Confidential'}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                Timeline / Year
              </span>
              <span className="text-sm font-bold text-white">{project.year || '2025'}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                Role & Scope
              </span>
              <span className="text-sm font-bold text-indigo-400">{project.category}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                Deliverables
              </span>
              <span className="text-sm font-bold text-white">Figma & Production Code</span>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="md" icon={ExternalLink} iconPosition="right">
                  Launch Live Demo
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
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="md" icon={Github}>
                  GitHub Repo
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Hero Cover Image Display */}
        <div className="rounded-3xl overflow-hidden glass-card border border-zinc-800 shadow-2xl mb-16 aspect-[16/9] bg-zinc-900">
          <img
            src={activeImage || project.coverImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gallery Thumbnails (if multiple images) */}
        {gallery.length > 0 && (
          <div className="mb-16">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Project Gallery & High-Res Screens ({gallery.length + 1})
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {[project.coverImage, ...gallery].map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`rounded-xl overflow-hidden aspect-[16/10] border-2 transition-all ${
                    activeImage === imgUrl ? 'border-indigo-500 scale-105 shadow-lg' : 'border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Breakdown: Problem, Solution, Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {project.challenges && (
            <div className="p-8 rounded-2xl glass-card border border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                01. The Challenge
              </span>
              <h3 className="text-xl font-bold font-display text-white">Problem Statement</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{project.challenges}</p>
            </div>
          )}

          {project.solutions && (
            <div className="p-8 rounded-2xl glass-card border border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                02. The Strategy
              </span>
              <h3 className="text-xl font-bold font-display text-white">Design & Engineering</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{project.solutions}</p>
            </div>
          )}

          {project.results && (
            <div className="p-8 rounded-2xl glass-card border border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                03. The Impact
              </span>
              <h3 className="text-xl font-bold font-display text-white">Business Outcomes</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{project.results}</p>
            </div>
          )}
        </div>

        {/* Full In-Depth Narrative */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-zinc-800 mb-16 space-y-6">
          <h3 className="text-2xl font-bold font-display text-white">Deep-Dive Case Study Narrative</h3>
          <div className="prose prose-invert max-w-none text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {project.description}
          </div>

          {/* Tags */}
          <div className="pt-8 border-t border-zinc-800 flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Projects */}
        {related.length > 0 && (
          <div className="pt-8 border-t border-zinc-800">
            <h3 className="text-2xl font-bold font-display text-white mb-8">
              More {project.category} Case Studies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/portfolio/${rel.slug}`}
                  className="p-4 rounded-2xl glass-card border border-zinc-800 hover:border-indigo-500/40 transition-colors group"
                >
                  <div className="rounded-xl overflow-hidden aspect-[16/10] bg-zinc-900 mb-3">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover transform transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors truncate">
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
