import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  FolderKanban,
  Layers,
  Calculator,
  UserCheck,
  Calendar,
  Sparkles,
  Zap,
  CheckCircle2,
} from 'lucide-react';

const PATHWAY_ROUTES = [
  {
    title: 'Explore Live Portfolio',
    desc: 'Browse 24+ curated commercial deliverables & video reels with interactive slider previews.',
    link: '/portfolio',
    icon: FolderKanban,
    badge: '24+ Works',
    badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    actionText: 'Open Portfolio Gallery',
    highlight: 'Filter by Logo, Ads, UGC & Covers',
  },
  {
    title: 'Explore 4 Design Disciplines',
    desc: 'Deep-dive into full deliverables, workflow phases, and transparent pricing packages.',
    link: '/services',
    icon: Layers,
    badge: '4 Core Services',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    actionText: 'Browse All Services',
    highlight: 'Branding, Ads, UGC & Covers',
  },
  {
    title: 'Project Tier & Cost Estimator',
    desc: 'Interactive budget calculator to calculate precise costs and turnarounds for your deliverables.',
    link: '/pricing',
    icon: Calculator,
    badge: 'Instant Estimate',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    actionText: 'Calculate Budget & ROI',
    highlight: 'Zero Obligation Pricing',
  },
  {
    title: 'Meet Md Sakhawat Hossain',
    desc: 'Learn about 3+ years design experience, design methodology, tool stacks & verified client trust.',
    link: '/about',
    icon: UserCheck,
    badge: 'Designer Bio',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    actionText: 'Read Design Story',
    highlight: 'Figma, Adobe Suite & Motion',
  },
  {
    title: 'Book a 1-on-1 Strategy Call',
    desc: 'Schedule an instant 30-minute discovery call to align on your brand benchmarks & deadlines.',
    link: '/book-a-meeting',
    icon: Calendar,
    badge: 'Direct Calendar',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    actionText: 'Pick Time On Calendar',
    highlight: 'Instant Google Meet / Zoom',
    primary: true,
  },
];

export const InterconnectedExploreHub = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-zinc-950/80 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Website Roadmap</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
            Where Would You Like To Go Next?
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Select your preferred pathway below to explore case studies, calculate project budgets, or book an introductory strategy call.
          </p>
        </div>

        {/* 5-Column / Responsive Grid of Interactive Roadmaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PATHWAY_ROUTES.map((route, idx) => {
            const Icon = route.icon;
            const isPrimary = route.primary;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -6 }}
                className={`p-6 sm:p-7 rounded-3xl border shadow-xl flex flex-col justify-between group transition-all duration-300 ${
                  isPrimary
                    ? 'bg-gradient-to-br from-teal-950/60 via-zinc-950 to-teal-950/80 border-teal-500/50 hover:border-teal-400 hover:shadow-teal-500/20'
                    : 'bg-zinc-950/90 border-zinc-800/80 hover:border-teal-500/40 hover:shadow-teal-950/20'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg ${
                        isPrimary
                          ? 'bg-teal-500 text-zinc-950 font-bold'
                          : 'bg-zinc-900 border border-zinc-800 text-teal-400 group-hover:border-teal-500/40'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${route.badgeColor}`}>
                      {route.badge}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h3 className="text-xl font-bold font-display text-white group-hover:text-teal-300 transition-colors">
                      {route.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {route.desc}
                    </p>
                  </div>

                  {/* Highlight pill */}
                  <div className="pt-2">
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-teal-400" />
                      <span>{route.highlight}</span>
                    </span>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="pt-6 mt-4 border-t border-zinc-800/70">
                  <Link
                    to={route.link}
                    className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isPrimary
                        ? 'bg-teal-500 hover:bg-teal-400 text-zinc-950 font-black shadow-md hover:shadow-teal-500/30'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 group-hover:border-teal-500/40'
                    }`}
                  >
                    <span>{route.actionText}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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

export default InterconnectedExploreHub;
