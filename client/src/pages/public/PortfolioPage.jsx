import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Sparkles,
  Search,
  ArrowRight,
  ExternalLink,
  FolderKanban,
  Eye,
  Filter,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const categories = [
  'All',
  'Logo & Branding',
  'Ads Creative',
  'E-commerce',
  'Product Design',
  'Social Media',
  'UGC Video',
  'Cover Branding',
  'Thumbnail',
  'Print Design',
  'AI Video',
];

const PortfolioPage = () => {
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProject, setQuickViewProject] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.success && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await api.get('/projects', {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchQuery || undefined,
        });
        if (res.success) {
          setProjects(res.data || []);
        }
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      {/* Background glow */}
      <div className="ambient-glow-teal top-20 right-1/4 opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {settings.portfolio_header_badge || 'Selected Portfolio Case Studies'}
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight">
            {settings.portfolio_header_title || 'Creative Graphic Design Showcase'}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300">
            {settings.portfolio_header_subtitle || 'Explore commercial brand identities, high-converting social ad creatives, e-commerce product designs, and dynamic video edits.'}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-zinc-800">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40 font-bold'
                      : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Search */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <Loader message="Loading portfolio case studies..." fullScreen />
        ) : projects.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl border border-zinc-800 space-y-4">
            <FolderKanban className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Projects Found</h3>
            <p className="text-xs text-zinc-400">
              Try adjusting your category filter or search query.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-3xl glass-card border border-zinc-800 overflow-hidden hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail Cover */}
                  <div className="aspect-[16/10] overflow-hidden bg-zinc-900 relative">
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Category pill */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-teal-300 uppercase tracking-wider">
                        {proj.category}
                      </span>
                    </div>

                    {/* Quick View Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setQuickViewProject(proj)}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-900/90 text-white text-xs font-semibold hover:bg-teal-600 transition-colors flex items-center gap-1.5 backdrop-blur-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quick View</span>
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{proj.client || 'Featured Project'}</span>
                      <span>{proj.year || '2024'}</span>
                    </div>

                    <Link to={`/portfolio/${proj.slug}`}>
                      <h3 className="text-xl font-bold font-display text-white group-hover:text-teal-300 transition-colors leading-snug">
                        {proj.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {proj.summary}
                    </p>

                    {/* Tags */}
                    {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Link */}
                <div className="p-6 pt-0">
                  <Link
                    to={`/portfolio/${proj.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    <span>Read Full Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick View Modal */}
        {quickViewProject && (
          <Modal
            isOpen={Boolean(quickViewProject)}
            onClose={() => setQuickViewProject(null)}
            title={quickViewProject.title}
            subtitle={`${quickViewProject.category} • ${quickViewProject.client || 'Brand Project'}`}
            maxWidth="max-w-3xl"
          >
            <div className="space-y-6">
              <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-zinc-900 border border-zinc-800">
                <img
                  src={quickViewProject.coverImage}
                  alt={quickViewProject.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {quickViewProject.description}
                </p>

                {quickViewProject.results && (
                  <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs">
                    <span className="font-bold text-teal-300 block mb-1">Key Results:</span>
                    <p className="text-zinc-300">{quickViewProject.results}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <Button variant="ghost" size="sm" onClick={() => setQuickViewProject(null)}>
                  Close
                </Button>
                <Link to={`/portfolio/${quickViewProject.slug}`}>
                  <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                    View Complete Case Study
                  </Button>
                </Link>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
