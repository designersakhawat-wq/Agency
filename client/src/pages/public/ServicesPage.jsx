import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers,
  Palette,
  Megaphone,
  Video,
  Layout,
  TrendingUp,
  Zap,
  ShieldCheck,
  Target,
  Flame,
  Award,
  Clock,
  Coins,
  MessageCircle,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import FaqAccordion from '../../components/home/FaqAccordion';
import { InteractiveProjectEstimator } from '../../components/home/InteractiveProjectEstimator';
import { PackageActionModal } from '../../components/common/PackageActionModal';
import { api } from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import { DEFAULT_SERVICES, DEFAULT_FAQS } from '../../data/defaultData';
import { safeSetItem } from '../../utils/safeStorage';

const iconMap = {
  Palette: Palette,
  Megaphone: Megaphone,
  Video: Video,
  Layout: Layout,
  Sparkles: Sparkles,
};

// Streamlined, punchy highlights for each core service
const SERVICE_META = {
  'logo-branding': {
    badge: 'High-Ticket Brand Identity',
    turnaround: '3–5 Days',
    benefit: 'Command premium rates with an authoritative vector identity system.',
    chips: ['100% Vector (.AI, .EPS)', 'Style Guide (PDF)', 'Social Kit', 'Commercial Rights'],
    gradient: 'from-amber-500/20 via-teal-500/10 to-transparent',
  },
  'ads-creative': {
    badge: 'ROAS & Conversion',
    turnaround: '24–48 Hours',
    benefit: 'Direct-response ad visuals engineered to lower CPA and boost CTR.',
    chips: ['1:1 Feed + 9:16 Story', 'A/B Hook Variations', 'Layered .PSD', 'Zero Text Penalty'],
    gradient: 'from-teal-500/20 via-cyan-500/10 to-transparent',
  },
  'ugc-video': {
    badge: 'Viral Engagement',
    turnaround: '48 Hours',
    benefit: 'Hook-driven vertical video editing designed to stop the scroll in 3s.',
    chips: ['Dynamic Captions', '3s Visual Hooks', 'Sound Effects', '4K Vertical MP4'],
    gradient: 'from-rose-500/20 via-purple-500/10 to-transparent',
  },
  'cover-branding': {
    badge: 'Omnichannel Presence',
    turnaround: '2 Days',
    benefit: 'Pixel-perfect digital storefront & executive profile header kits.',
    chips: ['Mobile Safe Zones', 'LinkedIn & YouTube', 'Shopify Storefront', 'Lossless PNG'],
    gradient: 'from-blue-500/20 via-teal-500/10 to-transparent',
  },
};

// Interactive Diagnostic Tool Options
const DIAGNOSTIC_PROBLEMS = [
  {
    id: 'ads_roas',
    icon: Megaphone,
    title: 'My ads have low CTR / high CPA',
    recommendedSlug: 'ads-creative',
    serviceTitle: 'Ads Creative',
    reason: 'Direct-Response Ad Creatives with psychological hooks will lower ad acquisition costs and scale ROAS.',
    roiImpact: 'Up to 3.8x Click-Through Rate & -42% CPA',
  },
  {
    id: 'brand_trust',
    icon: Palette,
    title: 'My brand looks amateur & loses high-ticket sales',
    recommendedSlug: 'logo-branding',
    serviceTitle: 'Logo & Branding',
    reason: 'A cohesive, luxury vector brand identity builds instant buyer confidence and justifies higher pricing.',
    roiImpact: 'Commands 2x to 5x higher project rates with elevated authority',
  },
  {
    id: 'video_retention',
    icon: Video,
    title: 'Short-form videos get low views & watch time',
    recommendedSlug: 'ugc-video',
    serviceTitle: 'UGC Video',
    reason: 'Dynamic UGC video editing with animated subtitles and 3-second hooks stops the scroll on TikTok/Reels.',
    roiImpact: 'Boosts viewer retention to 85%+ and sparks viral reach',
  },
  {
    id: 'store_social',
    icon: Layout,
    title: 'Social profiles & store banners look unpolished',
    recommendedSlug: 'cover-branding',
    serviceTitle: 'Cover Branding',
    reason: 'Precision multi-platform header branding unifies your visual presence across LinkedIn, YouTube & Stores.',
    roiImpact: 'Creates seamless omnichannel brand credibility on first impression',
  },
];

const getLocalJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const ServicesPage = () => {
  const { formatAmount } = useCurrency();
  const [services, setServices] = useState(() => getLocalJson('sakhawat_cached_services', DEFAULT_SERVICES));
  const [faqs, setFaqs] = useState(() => getLocalJson('sakhawat_cached_faqs', DEFAULT_FAQS));
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(DIAGNOSTIC_PROBLEMS[0]);

  // Modal State for Package Action (WhatsApp vs Book Meeting)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState('');
  const [modalPkg, setModalPkg] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const fetchData = async () => {
      try {
        const [srvRes, faqRes] = await Promise.all([
          api.get('/services').catch(() => ({ success: false })),
          api.get('/faqs').catch(() => ({ success: false })),
        ]);
        if (srvRes.success && Array.isArray(srvRes.data) && srvRes.data.length > 0) {
          setServices(srvRes.data);
          safeSetItem('sakhawat_cached_services', srvRes.data);
        }
        if (faqRes.success && Array.isArray(faqRes.data) && faqRes.data.length > 0) {
          setFaqs(faqRes.data);
          safeSetItem('sakhawat_cached_faqs', faqRes.data);
        }
      } catch (err) {
        console.error('Error loading services overview:', err);
      }
    };
    fetchData();
  }, []);

  // Open the dual-action modal
  const handleOpenActionModal = (serviceTitle, pkg) => {
    setModalService(serviceTitle);
    setModalPkg(pkg);
    setModalOpen(true);
  };

  // Filter services by category tab
  const filteredServices = services.filter((s) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'branding' && s.slug.includes('logo')) return true;
    if (activeTab === 'ads' && s.slug.includes('ads')) return true;
    if (activeTab === 'video' && s.slug.includes('ugc')) return true;
    if (activeTab === 'covers' && s.slug.includes('cover')) return true;
    return true;
  });

  return (
    <div className="pt-44 sm:pt-48 pb-24 min-h-screen relative overflow-hidden">
      {/* Dynamic Animated Ambient Glow Orbs */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -25, 0],
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="ambient-glow-teal -top-20 left-1/4 opacity-25 pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -25, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="ambient-glow-cyan top-1/2 right-10 opacity-20 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-24">
        {/* =========================================================================
            1. HERO: Animated & High-Impact
            ========================================================================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider relative overflow-hidden shadow-lg shadow-teal-950/40">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping absolute left-2.5 opacity-75" />
            <span className="w-2 h-2 rounded-full bg-teal-400 relative z-10" />
            <Sparkles className="w-3.5 h-3.5 ml-1.5" />
            <span>High-Converting Creative Solutions</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight leading-tight"
          >
            Strategic Design Services That <span className="gradient-brand">Drive Real Sales</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed"
          >
            From direct-response advertising creatives to authoritative brand identities and viral UGC video editing. Every asset is engineered for speed, conversion, and commercial readiness.
          </motion.p>

          {/* Animated Trust Pillars */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 pt-3 text-xs text-zinc-400"
          >
            <motion.span whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 text-white font-medium bg-zinc-900/60 px-3 py-1.5 rounded-full border border-zinc-800/80">
              <Clock className="w-3.5 h-3.5 text-teal-400" /> 24–48h Delivery Available
            </motion.span>
            <span>•</span>
            <motion.span whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 text-white font-medium bg-zinc-900/60 px-3 py-1.5 rounded-full border border-zinc-800/80">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> 100% Commercial Rights
            </motion.span>
            <span>•</span>
            <motion.span whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 text-white font-medium bg-zinc-900/60 px-3 py-1.5 rounded-full border border-zinc-800/80">
              <Zap className="w-3.5 h-3.5 text-teal-400" /> Direct 1-on-1 Designer Access
            </motion.span>
          </motion.div>
        </motion.div>

        {/* =========================================================================
            2. INTERACTIVE PROBLEM DIAGNOSTIC WIDGET (Animated Switcher)
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="p-6 sm:p-8 rounded-3xl glass-card border border-teal-500/30 relative overflow-hidden shadow-2xl bg-white dark:bg-zinc-950/80 card-shine"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white">
                  What Problem Are You Trying to Solve?
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                Select an issue to reveal the exact ROI-driven fix
              </span>
            </div>

            {/* Diagnostic Interactive Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {DIAGNOSTIC_PROBLEMS.map((prob) => {
                const Icon = prob.icon;
                const isSelected = selectedDiagnostic.id === prob.id;
                return (
                  <motion.button
                    key={prob.id}
                    onClick={() => setSelectedDiagnostic(prob)}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer flex items-center gap-3 relative ${
                      isSelected
                        ? 'bg-teal-500/15 border-2 border-teal-500 shadow-xl shadow-teal-500/10'
                        : 'bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 hover:border-teal-500/40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-teal-500 text-zinc-950 shadow-md' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-bold leading-snug ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                      {prob.title}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Diagnostic Result Highlight Box with Smooth AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDiagnostic.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="p-5 sm:p-6 rounded-2xl bg-teal-500/10 dark:bg-zinc-900 border border-teal-500/30 dark:border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold font-mono">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Projected Result: {selectedDiagnostic.roiImpact}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                    {selectedDiagnostic.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                  <Link to={`/services/${selectedDiagnostic.recommendedSlug}`} className="w-full sm:w-auto">
                    <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full text-xs font-bold">
                      View {selectedDiagnostic.serviceTitle}
                    </Button>
                  </Link>
                  <button
                    onClick={() =>
                      handleOpenActionModal(selectedDiagnostic.serviceTitle, {
                        name: 'Starter Consultation',
                        price: 99,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:text-teal-600 dark:hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  >
                    Instant Order
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* =========================================================================
            3. CORE SERVICES SHOWCASE (Staggered Motion Cards Grid)
            ========================================================================= */}
        <div className="space-y-8">
          {/* Category Filter Tabs with Smooth Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-4xl font-display font-black text-white">
                Core Creative Capabilities
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Click any service to view sample portfolio projects, deliverables, and package options.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 self-start sm:self-auto relative">
              {[
                { id: 'all', label: 'All Services' },
                { id: 'ads', label: '🚀 Ads Creative' },
                { id: 'branding', label: '💎 Logo & Branding' },
                { id: 'video', label: '🔥 UGC Video' },
                { id: 'covers', label: '🛍️ Cover Branding' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer z-10 ${
                      isActive ? 'text-zinc-950 font-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryTab"
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                        className="absolute inset-0 bg-teal-400 rounded-xl -z-10 shadow-md"
                      />
                    )}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animated Service Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
          >
            {filteredServices.map((s, idx) => {
              const Icon = iconMap[s.icon] || Palette;
              const meta = SERVICE_META[s.slug] || {
                badge: 'Creative Service',
                turnaround: '2–4 Days',
                benefit: s.description,
                chips: ['High Res Formats', 'Source Files', 'Commercial Rights'],
                gradient: 'from-teal-500/20 to-transparent',
              };
              const packages = s.packages || [];
              let minPrice = null;
              if (packages.length > 0) {
                const prices = packages.map((p) => Number(p.price)).filter((p) => !isNaN(p));
                if (prices.length > 0) minPrice = Math.min(...prices);
              }
              const popularPkg = packages.find((p) => p.isPopular) || packages[0] || { name: 'Standard Package', price: minPrice || 149 };

              return (
                <motion.div
                  key={s.id}
                  variants={itemVariants}
                  whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
                  className="p-6 sm:p-8 rounded-3xl glass-card border border-zinc-800 hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between group space-y-6 relative overflow-hidden hover:shadow-2xl hover:shadow-teal-950/40 bg-zinc-950/70"
                >
                  {/* Subtle Gradient Hover Glow */}
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-3xl pointer-events-none`} />

                  <div className="space-y-4 relative z-10">
                    {/* Header: Icon + Badge + Price */}
                    <div className="flex items-center justify-between gap-2">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-zinc-950 transition-all shadow-md"
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                          {meta.turnaround}
                        </span>
                        {minPrice !== null && (
                          <span className="text-xs font-black px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-white group-hover:border-teal-400 transition-colors">
                            From {formatAmount(minPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Benefit */}
                    <div className="space-y-1">
                      <Link to={`/services/${s.slug}`} className="block group-hover:text-teal-300 transition-colors">
                        <h3 className="text-2xl font-bold font-display text-white flex items-center justify-between">
                          <span>{s.title}</span>
                          <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-teal-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
                        </h3>
                      </Link>
                      <p className="text-xs sm:text-sm text-teal-300/90 font-medium">
                        {meta.benefit}
                      </p>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {s.description}
                    </p>

                    {/* Deliverable Feature Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {meta.chips.map((chip, cIdx) => (
                        <motion.span
                          key={cIdx}
                          whileHover={{ scale: 1.05 }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800/80 text-zinc-300 font-medium hover:border-teal-500/30 hover:text-white transition-colors"
                        >
                          ✓ {chip}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3 relative z-10">
                    <Link to={`/services/${s.slug}`} className="flex-1">
                      <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" className="w-full text-xs font-bold shadow-lg shadow-teal-950/50">
                        View Service & Portfolio
                      </Button>
                    </Link>
                    <button
                      onClick={() => handleOpenActionModal(s.title, popularPkg)}
                      className="cursor-pointer"
                    >
                      <Button variant="secondary" size="sm" icon={MessageCircle} className="text-xs">
                        Quick Order
                      </Button>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* =========================================================================
            4. LIVE INTERACTIVE PROJECT ESTIMATOR
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <InteractiveProjectEstimator />
        </motion.div>

        {/* =========================================================================
            5. FAQS
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <FaqAccordion faqs={faqs} />
        </motion.div>
      </div>

      {/* Package Action Modal: Instant WhatsApp vs Book Meeting */}
      <PackageActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceName={modalService}
        pkg={modalPkg}
      />
    </div>
  );
};

export default ServicesPage;
