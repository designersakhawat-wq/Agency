import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  ShieldCheck,
  Globe,
  Star,
  CheckCircle2,
  Zap,
  TrendingUp,
} from 'lucide-react';
import Button from '../common/Button';
import { Badge } from '../common/Badge';

export const HeroSection = ({ settings, onOpenBooking }) => {
  const heroBadge = settings?.hero_badge || 'Available for Remote Creative Contracts';
  const heroTitle = settings?.hero_title || 'Creative Graphic Designer Helping Brands';
  const heroTitleHighlight = settings?.hero_title_highlight || 'Stand Out & Sell Better.';
  const heroSubtitle =
    settings?.hero_subtitle ||
    'Specializing in high-converting advertising creatives, memorable brand identities, e-commerce product design, and dynamic UGC video content.';

  const heroPrimaryBtnText = settings?.hero_primary_btn_text || 'Explore My Portfolio';
  const heroPrimaryBtnLink = settings?.hero_primary_btn_link || '/portfolio';
  const heroSecondaryBtnText = settings?.hero_secondary_btn_text || 'Book Discovery Call';
  
  const heroTrustBadge1 = settings?.hero_trust_badge_1 || '3+ Years Experience';
  const heroTrustBadge2 = settings?.hero_trust_badge_2 || 'Global Clients (USA, Dubai, BD)';

  const showHeroImage = settings?.hero_show_image !== false;
  const heroImage = settings?.hero_image || '/uploads/chatgpt-image-aug-2--2026--10-56-34-pm-1787768328056-874988426.png';
  const heroCoreSpeciality = settings?.hero_core_speciality || 'Branding • Ad Creatives • UI';
  const heroDesignerName = settings?.hero_designer_name || 'Md Sakhawat Hossain';
  const heroDesignerTitle = settings?.hero_designer_title || 'Creative Graphic Designer';
  const heroDesignerStatus = settings?.hero_designer_status || 'Open to Work';

  const heroFloatingTopVal = settings?.hero_floating_top_val || '150+ Creatives';
  const heroFloatingTopSub = settings?.hero_floating_top_sub || 'High ROI Campaigns';
  const heroFloatingBottomVal = settings?.hero_floating_bottom_val || '5.0 Star Rating';
  const heroFloatingBottomSub = settings?.hero_floating_bottom_sub || '100% Client Praise';

  // Animation variants for smooth stagger
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
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-32 overflow-hidden">
      {/* Ambient Animated Background Glow Orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="ambient-glow-teal top-12 left-1/4 -translate-x-1/2 opacity-30 pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 25, -25, 0],
          scale: [1, 0.95, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="ambient-glow-cyan top-36 right-8 opacity-25 pointer-events-none"
      />
      <div className="ambient-glow-violet -bottom-20 left-1/3 opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`grid grid-cols-1 ${showHeroImage ? 'lg:grid-cols-12' : 'max-w-4xl mx-auto'} gap-12 lg:gap-8 items-center`}>
          {/* Left Text Col */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`${showHeroImage ? 'lg:col-span-7 text-center lg:text-left' : 'text-center'} space-y-6`}
          >
            {/* Availability Badge with Animated Radar Ping */}
            {heroBadge && (
              <motion.div variants={itemVariants} className={`inline-flex items-center ${!showHeroImage ? 'justify-center' : ''}`}>
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-lg shadow-teal-950/40 backdrop-blur-md">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400" />
                  </span>
                  <span className="tracking-wide">{heroBadge}</span>
                </div>
              </motion.div>
            )}

            {/* Main Headline with Animated Gradient Brand */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-[60px] font-display font-black text-white tracking-tight leading-[1.1]"
            >
              {heroTitle}{' '}
              {heroTitleHighlight && (
                <span className="gradient-brand-animated">
                  {heroTitleHighlight}
                </span>
              )}
            </motion.h1>

            {/* Subtitle */}
            {heroSubtitle && (
              <motion.p
                variants={itemVariants}
                className={`text-base sm:text-lg text-zinc-300 ${showHeroImage ? 'max-w-2xl mx-auto lg:mx-0' : 'max-w-3xl mx-auto'} leading-relaxed font-light`}
              >
                {heroSubtitle}
              </motion.p>
            )}

            {/* CTAs with Micro Hover Spring Effects */}
            <motion.div
              variants={itemVariants}
              className={`flex flex-wrap items-center ${showHeroImage ? 'justify-center lg:justify-start' : 'justify-center'} gap-4 pt-2`}
            >
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Link to={heroPrimaryBtnLink}>
                  <Button
                    variant="primary"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="shadow-xl shadow-teal-950/60 font-bold cursor-pointer"
                  >
                    {heroPrimaryBtnText}
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Link to="/book-a-meeting">
                  <Button variant="secondary" size="lg" icon={Calendar} className="cursor-pointer font-bold">
                    {heroSecondaryBtnText}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Quick Interactive Direct Gateway Route Pills */}
            <motion.div
              variants={itemVariants}
              className={`flex flex-wrap items-center ${showHeroImage ? 'justify-center lg:justify-start' : 'justify-center'} gap-2 pt-2`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-teal-400" />
                <span>Jump to:</span>
              </span>
              <Link
                to="/services/logo-branding"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-teal-500/10 border border-zinc-800 hover:border-teal-500/50 text-zinc-300 hover:text-white text-xs font-semibold transition-all hover:scale-105"
              >
                <span>🎨 Logo Design</span>
                <ArrowRight className="w-3 h-3 text-teal-400" />
              </Link>
              <Link
                to="/services/ads-creative"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-teal-500/10 border border-zinc-800 hover:border-teal-500/50 text-zinc-300 hover:text-white text-xs font-semibold transition-all hover:scale-105"
              >
                <span>⚡ Ads Creatives</span>
                <ArrowRight className="w-3 h-3 text-teal-400" />
              </Link>
              <Link
                to="/services/ugc-video"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-teal-500/10 border border-zinc-800 hover:border-teal-500/50 text-zinc-300 hover:text-white text-xs font-semibold transition-all hover:scale-105"
              >
                <span>🎬 UGC Reels</span>
                <ArrowRight className="w-3 h-3 text-teal-400" />
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:text-white text-xs font-bold transition-all hover:scale-105"
              >
                <span>📁 Full Portfolio →</span>
              </Link>
            </motion.div>

            {/* Trust Markers with Subtle Badges */}
            {(heroTrustBadge1 || heroTrustBadge2) && (
              <motion.div
                variants={itemVariants}
                className={`pt-6 border-t border-zinc-800/80 flex flex-wrap items-center ${showHeroImage ? 'justify-center lg:justify-start' : 'justify-center'} gap-6 text-xs text-zinc-400`}
              >
                {heroTrustBadge1 && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="text-zinc-200 font-semibold">{heroTrustBadge1}</span>
                  </motion.div>
                )}
                {heroTrustBadge2 && (
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60"
                  >
                    <Globe className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>{heroTrustBadge2}</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Right Visual Col with 3D Floating Elements */}
          {showHeroImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              {/* Ambient Backlight Ring */}
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 via-cyan-500/10 to-transparent rounded-3xl blur-2xl -z-10 scale-95" />

              <div className="relative rounded-3xl overflow-hidden glass-card p-3.5 border border-zinc-800/90 shadow-2xl card-shine group">
                {/* Designer Showcase Frame */}
                <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900 relative">
                  <img
                    src={heroImage}
                    alt={heroDesignerName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/uploads/chatgpt-image-aug-2--2026--10-56-34-pm-1787768328056-874988426.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Gradient vignette on bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Floating pill Top: Core Focus with gentle float animation */}
                  {heroCoreSpeciality && (
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-4 left-4 p-3 rounded-2xl glass-panel border border-teal-500/30 backdrop-blur-xl space-y-0.5 shadow-xl"
                    >
                      <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider block">
                        Core Speciality
                      </span>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-teal-300 animate-spin-slow" />
                        <span>{heroCoreSpeciality}</span>
                      </p>
                    </motion.div>
                  )}

                  {/* Floating pill Bottom: Designer Profile */}
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl glass-panel border border-teal-500/30 backdrop-blur-xl flex items-center justify-between shadow-2xl">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{heroDesignerName}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                      </h4>
                      <p className="text-xs text-teal-300/90 font-medium">{heroDesignerTitle}</p>
                    </div>
                    {heroDesignerStatus && (
                      <Badge variant="brand" size="sm" dot>
                        {heroDesignerStatus}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Micro Badge 1: Top-Right */}
              {heroFloatingTopVal && (
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, 1.5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-5 -right-4 sm:-right-6 p-3 rounded-2xl glass-card border border-teal-500/40 shadow-xl backdrop-blur-xl flex items-center gap-2.5 z-20"
                >
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{heroFloatingTopVal}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{heroFloatingTopSub}</p>
                  </div>
                </motion.div>
              )}

              {/* Floating Micro Badge 2: Bottom-Left */}
              {heroFloatingBottomVal && (
                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [0, -1.5, 0] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-5 -left-4 sm:-left-6 p-3 rounded-2xl glass-card border border-amber-500/40 shadow-xl backdrop-blur-xl flex items-center gap-2.5 z-20"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{heroFloatingBottomVal}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{heroFloatingBottomSub}</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
