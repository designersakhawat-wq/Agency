import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Palette,
  Megaphone,
  Video,
  Layout,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  Eye,
  Film,
} from 'lucide-react';

const DOMAIN_DATA = [
  {
    id: 'logo-branding',
    title: 'Logo & Brand Identity',
    slug: 'logo-branding',
    icon: Palette,
    accent: 'from-amber-500/20 via-teal-500/10 to-transparent',
    border: 'hover:border-amber-500/50',
    tag: 'Brand Systems',
    headline: 'Memorable brand marks & vector guideline systems',
    features: ['Infinite Vector .AI / .EPS', 'Brand Guidelines Book', 'Social Avatars & Favicons'],
    portfolioAnchor: '/portfolio#logo-branding',
    servicePage: '/services/logo-branding',
    workCount: '6+ Works',
  },
  {
    id: 'ads-creative',
    title: 'High-CTR Ad Creatives',
    slug: 'ads-creative',
    icon: Megaphone,
    accent: 'from-teal-500/20 via-cyan-500/10 to-transparent',
    border: 'hover:border-teal-500/50',
    tag: 'Performance Ads',
    headline: 'High-converting static & story assets for Meta / LinkedIn',
    features: ['1080x1080 Feed Creatives', '9:16 Story / Reels Ads', 'Editable Master PSD Source'],
    portfolioAnchor: '/portfolio#ads-creative',
    servicePage: '/services/ads-creative',
    workCount: '5+ Works',
  },
  {
    id: 'ugc-video',
    title: 'UGC & Motion Video Reels',
    slug: 'ugc-video',
    icon: Video,
    accent: 'from-rose-500/20 via-teal-500/10 to-transparent',
    border: 'hover:border-rose-500/50',
    tag: 'Short-Form Video',
    headline: 'High-engagement 9:16 vertical reels & TikTok edits',
    features: ['1080p/4K 60FPS Edits', 'Dynamic Burned-In Captions', 'Beat-Synced Sound Design'],
    portfolioAnchor: '/portfolio#ugc-video',
    servicePage: '/services/ugc-video',
    workCount: '4+ Works (▶ Embedded)',
  },
  {
    id: 'cover-branding',
    title: 'Cover & Social Branding',
    slug: 'cover-branding',
    icon: Layout,
    accent: 'from-cyan-500/20 via-indigo-500/10 to-transparent',
    border: 'hover:border-cyan-500/50',
    tag: 'Header Packaging',
    headline: 'Safe-zone calibrated banners for YouTube & LinkedIn',
    features: ['Safe-Zone LinkedIn Headers', '2560x1440 YouTube Art', 'Facebook & X Header Suite'],
    portfolioAnchor: '/portfolio#cover-branding',
    servicePage: '/services/cover-branding',
    workCount: '4+ Works',
  },
];

export const CreativeGatewayHub = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-[#09090b]/60 border-y border-white/[0.04]">
      {/* Background ambient lighting */}
      <div className="ambient-glow-teal top-1/4 right-10 opacity-15 pointer-events-none" />
      <div className="ambient-glow-cyan bottom-10 left-10 opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header with Cross-Page Connective Context */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-zinc-800/80">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Page Exploration Gateway</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
              Explore By Creative Domain
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Every creative discipline has dedicated case studies, live portfolio galleries, and detailed pricing packages. Pick your domain to explore:
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-all hover:scale-105"
            >
              <span>📁 Open Full Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-black transition-all hover:scale-105 shadow-md shadow-teal-950/40"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Interactive Domain Gateway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DOMAIN_DATA.map((domain, idx) => {
            const Icon = domain.icon;
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className={`p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800/80 ${domain.border} shadow-xl flex flex-col justify-between group transition-all duration-300 relative overflow-hidden`}
              >
                {/* Subtle Gradient Glow Accent */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${domain.accent} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
                />

                <div className="space-y-4 relative z-10">
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:border-teal-500/50 text-teal-400 flex items-center justify-center transition-all group-hover:scale-110 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                      {domain.workCount}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
                      {domain.tag}
                    </span>
                    <h3 className="text-lg font-bold font-display text-white group-hover:text-teal-300 transition-colors">
                      {domain.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {domain.headline}
                    </p>
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                    {domain.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-[11px] text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2-Way Cross Page Pathways */}
                <div className="pt-5 mt-4 border-t border-zinc-800/80 space-y-2 relative z-10">
                  {/* Link to Portfolio Section */}
                  <Link
                    to={domain.portfolioAnchor}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-900/90 hover:bg-teal-500/10 border border-zinc-800 hover:border-teal-500/40 text-teal-300 hover:text-white text-xs font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-teal-400" />
                      <span>View Portfolio Slider</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Link to Dedicated Service Page */}
                  <Link
                    to={domain.servicePage}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium flex items-center justify-between transition-all"
                  >
                    <span>Pricing & Full Scope</span>
                    <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CreativeGatewayHub;
