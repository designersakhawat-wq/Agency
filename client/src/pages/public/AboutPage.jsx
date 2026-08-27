import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  Palette,
  Megaphone,
  Video,
  Layout,
  Briefcase,
  Globe,
  Wrench,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageCircle,
  Clock,
  Check,
  Target,
  FileCheck,
  HeartHandshake,
  Star,
  ExternalLink,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';

const getLocalJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

// Default Fallbacks if not set in backend CMS
const DEFAULT_PHILOSOPHY_PILLARS = [
  {
    icon: 'Target',
    title: 'Marketing & ROI Focused',
    desc: 'Every color, headline hierarchy, and visual hook is engineered with consumer psychology to stop the scroll and maximize ROAS.',
  },
  {
    icon: 'FileCheck',
    title: 'Master Layered Source Files',
    desc: 'You receive 100% organized, named vector .AI, .EPS, and layered Figma / PSD files ready for infinite commercial scaling.',
  },
  {
    icon: 'Clock',
    title: 'Reliable 24–48h Turnaround',
    desc: 'Strict adherence to project deadlines, rapid drafting, and proactive communication via WhatsApp and Google Meet.',
  },
  {
    icon: 'HeartHandshake',
    title: 'Full Commercial Release',
    desc: 'Complete intellectual property rights and commercial license handover upon project approval with zero hidden royalties.',
  },
];

const DEFAULT_EXPERIENCES = [
  {
    company: 'e-Learn IT Institute',
    role: 'Senior Ruffles Designer & Creative Lead',
    period: 'Recent / Current',
    location: 'Bangladesh (Remote)',
    desc: 'Directing marketing creative campaigns, high-converting course enrollment banners, team design standards, and digital promotional branding.',
    tags: ['Creative Direction', 'Campaign Design', 'Team Mentorship'],
  },
  {
    company: 'Optiva Max',
    role: 'Senior Graphic Designer',
    period: 'Previous',
    location: 'Dubai, UAE (Remote)',
    desc: 'Engineered high-converting e-commerce product visual packaging, digital store branding, and sales-focused social media advertising assets.',
    tags: ['E-Commerce', 'Product Branding', 'Direct Response'],
  },
  {
    company: 'ORA Organic',
    role: 'Senior Graphic & Visual Designer',
    period: 'Previous',
    location: 'Dubai, UAE',
    desc: 'Crafted premium wellness product visual framing and Meta ad creatives resulting in a documented +42% ROAS increase for paid campaigns.',
    tags: ['Wellness Brand', 'Meta Ads', '+42% ROAS'],
  },
  {
    company: 'Advanced Digital Automotive',
    role: 'Independent Designer & AI Video Editor',
    period: 'Previous',
    location: 'United States (Remote)',
    desc: 'Produced high-CTR YouTube thumbnails, print brand collateral, brand identity guidelines, and dynamic short-form AI video edits.',
    tags: ['USA Client', 'YouTube Branding', 'Motion Reels'],
  },
  {
    company: 'Kenakata Shop',
    role: 'Graphic Designer',
    period: 'Previous',
    location: 'Bangladesh',
    desc: 'Developed gadget and lifestyle e-commerce promotional creatives, packaging badge overlays, and social media marketing assets.',
    tags: ['E-Commerce', 'Gadget Branding', 'Social Media'],
  },
];

const DEFAULT_TOOLCHAIN = [
  {
    name: 'Adobe Photoshop',
    category: 'High-End Photo Manipulation & Retouching',
    level: '98%',
    iconType: 'photoshop',
  },
  {
    name: 'Adobe Illustrator',
    category: 'Precision Vector Logos & Brand Identity',
    level: '95%',
    iconType: 'illustrator',
  },
  {
    name: 'Adobe Premiere Pro',
    category: 'Commercial Video Pacing & Cut Editing',
    level: '90%',
    iconType: 'premiere',
  },
  {
    name: 'Adobe After Effects',
    category: 'Motion Graphics, Titles & Kinetic VFX',
    level: '85%',
    iconType: 'aftereffects',
  },
  {
    name: 'Figma',
    category: 'UI Design Systems, Mockups & Web Assets',
    level: '92%',
    iconType: 'figma',
  },
  {
    name: 'CapCut Pro',
    category: 'Dynamic 9:16 Vertical Reels & Burned-In Captions',
    level: '96%',
    iconType: 'capcut',
  },
];

const CORE_DISCIPLINES = [
  {
    title: 'Logo & Brand Systems',
    desc: 'Distinctive brand marks, color hierarchies, typography standards, and brand styleguides.',
    icon: Palette,
    link: '/services/logo-branding',
    portfolioLink: '/portfolio#logo-branding',
  },
  {
    title: 'High-CTR Ad Creatives',
    desc: 'Meta (FB/IG) 1:1 feed banners, 9:16 vertical story ads, and high-converting promotional angles.',
    icon: Megaphone,
    link: '/services/ads-creative',
    portfolioLink: '/portfolio#ads-creative',
  },
  {
    title: 'UGC & Motion Video Reels',
    desc: 'Dynamic 9:16 vertical TikTok/Reels edits, kinetic burned-in subtitles, and sound design.',
    icon: Video,
    link: '/services/ugc-video',
    portfolioLink: '/portfolio#ugc-video',
  },
  {
    title: 'Cover & Social Packaging',
    desc: 'Safe-zone calibrated LinkedIn banners, 2560x1440 YouTube channel art, and digital storefronts.',
    icon: Layout,
    link: '/services/cover-branding',
    portfolioLink: '/portfolio#cover-branding',
  },
];

// Authentic Real Software Brand Logos
const PhotoshopIcon = () => (
  <div className="w-11 h-11 rounded-2xl bg-[#001e36] border border-[#00a8ff]/40 flex items-center justify-center font-black text-[#00a8ff] text-base shadow-lg font-sans select-none shrink-0 tracking-tighter">
    Ps
  </div>
);

const IllustratorIcon = () => (
  <div className="w-11 h-11 rounded-2xl bg-[#330000] border border-[#ff9a00]/40 flex items-center justify-center font-black text-[#ff9a00] text-base shadow-lg font-sans select-none shrink-0 tracking-tighter">
    Ai
  </div>
);

const PremiereIcon = () => (
  <div className="w-11 h-11 rounded-2xl bg-[#00005b] border border-[#9999ff]/40 flex items-center justify-center font-black text-[#9999ff] text-base shadow-lg font-sans select-none shrink-0 tracking-tighter">
    Pr
  </div>
);

const AfterEffectsIcon = () => (
  <div className="w-11 h-11 rounded-2xl bg-[#00005b] border border-[#d291ff]/40 flex items-center justify-center font-black text-[#d291ff] text-base shadow-lg font-sans select-none shrink-0 tracking-tighter">
    Ae
  </div>
);

const FigmaLogo = () => (
  <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-lg shrink-0">
    <svg className="w-6 h-6" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
      <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
      <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
      <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
      <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
    </svg>
  </div>
);

const CapCutLogo = () => (
  <div className="w-11 h-11 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-lg shrink-0">
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6.5L12 12L3 17.5V6.5Z" fill="#00f2fe"/>
      <path d="M21 6.5L12 12L21 17.5V6.5Z" fill="#4facfe"/>
    </svg>
  </div>
);

const resolveToolIcon = (tool) => {
  const t = (tool?.iconType || tool?.name || '').toLowerCase();
  if (t.includes('photo') || t === 'photoshop') return PhotoshopIcon;
  if (t.includes('illust') || t === 'illustrator') return IllustratorIcon;
  if (t.includes('prem') || t === 'premiere') return PremiereIcon;
  if (t.includes('after') || t === 'aftereffects') return AfterEffectsIcon;
  if (t.includes('figma')) return FigmaLogo;
  if (t.includes('capcut')) return CapCutLogo;
  return PhotoshopIcon;
};

const resolvePillarIcon = (iconName) => {
  switch ((iconName || '').toLowerCase()) {
    case 'target':
      return Target;
    case 'filecheck':
      return FileCheck;
    case 'clock':
      return Clock;
    case 'hearthandshake':
      return HeartHandshake;
    case 'shieldcheck':
      return ShieldCheck;
    case 'zap':
      return Zap;
    case 'trendingup':
      return TrendingUp;
    case 'award':
      return Award;
    case 'sparkles':
      return Sparkles;
    default:
      return ShieldCheck;
  }
};

export const AboutPage = () => {
  const [settings, setSettings] = useState(() => getLocalJson('sakhawat_cached_settings', {}));

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
          localStorage.setItem('sakhawat_cached_settings', JSON.stringify(res.data));
        }
      })
      .catch(() => {});
  }, []);

  // Dynamic Content with CMS Fallbacks
  const designerName = settings?.designer_name || settings?.hero_designer_name || 'Md Sakhawat Hossain';
  const designerTitle = settings?.designer_title || settings?.hero_designer_title || 'Senior Creative Graphic Designer';
  const heroBadge = settings?.about_hero_badge || 'Senior Creative Partner';
  const heroHeading = settings?.about_hero_heading || 'Visual Creatives Built for Authority & High ROAS';
  const bio1 =
    settings?.about_bio_1 ||
    'I partner with forward-thinking e-commerce brands, digital agencies, and creators across Bangladesh, Dubai, and the USA to craft high-converting visual identities, ad creatives, and dynamic video reels.';
  const bio2 =
    settings?.about_bio_2 ||
    'My design philosophy merges consumer psychology with pixel-perfect craftsmanship. Whether you need a memorable brand identity from scratch or high-CTR ad creative variations to scale paid campaigns, I deliver assets engineered for measurable growth.';
  const aboutImage =
    settings?.about_image ||
    settings?.hero_image ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80';
  const yearsExp = settings?.about_years_exp || settings?.years_experience || '3+';
  const projectsCount = settings?.about_projects_count || '150+';
  const clientRating = settings?.about_client_rating || '5.0 ★';
  const location = settings?.about_location_str || settings?.contact_location || 'Ishurdi, Pabna, Bangladesh (Working Worldwide)';
  const languagesStr = settings?.about_languages_str || 'Bangla & English';
  const availability = settings?.about_availability_str || settings?.availability_status || 'Available for Projects';
  const whatsappNum = settings?.whatsapp_number || '01781955355';
  const whatsappUrl = `https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Hello Sakhawat! I explored your About page and would like to discuss a design project.'
  )}`;

  const ctaHeading = settings?.about_cta_heading || 'Ready to Upgrade Your Visual Brand?';
  const ctaSubtitle =
    settings?.about_cta_subtitle ||
    'Available immediately for commercial design projects, monthly brand retainers, and performance marketing asset creation.';

  const philosophyPillars =
    Array.isArray(settings?.about_philosophy_pillars) && settings.about_philosophy_pillars.length > 0
      ? settings.about_philosophy_pillars
      : DEFAULT_PHILOSOPHY_PILLARS;

  const experiences =
    Array.isArray(settings?.about_experiences) && settings.about_experiences.length > 0
      ? settings.about_experiences
      : DEFAULT_EXPERIENCES;

  const toolchain =
    Array.isArray(settings?.about_toolchain) && settings.about_toolchain.length > 0
      ? settings.about_toolchain
      : DEFAULT_TOOLCHAIN;

  return (
    <div className="pt-44 sm:pt-48 pb-28 min-h-screen relative overflow-hidden bg-black text-white">
      {/* Ambient background glows */}
      <div className="ambient-glow-teal top-20 left-1/4 opacity-20 pointer-events-none" />
      <div className="ambient-glow-cyan bottom-40 right-10 opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
        {/* =========================================================================
            1. EXECUTIVE PROFILE HERO
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Bio */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{heroBadge}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
                {heroHeading}
              </h1>
              <p className="text-sm font-bold text-teal-400">
                {designerName} — {designerTitle}
              </p>
            </div>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-light">
              {bio1}
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {bio2}
            </p>

            {/* Quick Metrics & Key Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-md">
                <span className="text-2xl font-black font-display text-white block">{yearsExp}</span>
                <span className="text-[11px] text-zinc-400 font-medium">Years Experience</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-md">
                <span className="text-2xl font-black font-display text-teal-400 block">{projectsCount}</span>
                <span className="text-[11px] text-zinc-400 font-medium">Projects Delivered</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-md">
                <span className="text-2xl font-black font-display text-white block">Global</span>
                <span className="text-[11px] text-zinc-400 font-medium">USA, Dubai, BD</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 shadow-md">
                <span className="text-2xl font-black font-display text-amber-400 block">{clientRating}</span>
                <span className="text-[11px] text-zinc-400 font-medium">Client Rating</span>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link to="/book-a-meeting">
                <Button variant="primary" size="md" icon={Calendar} className="font-black px-6 shadow-lg shadow-teal-950/50">
                  Book Discovery Call
                </Button>
              </Link>
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="md" icon={MessageCircle} className="font-bold text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10">
                  Chat on WhatsApp
                </Button>
              </a>
              <Link to="/portfolio">
                <Button variant="secondary" size="md" icon={ArrowUpRight} iconPosition="right">
                  View Portfolio
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Visual Card with Glowing Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden glass-card p-3 border-2 border-teal-500/40 shadow-2xl bg-zinc-950/90">
              <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900 relative group">
                <img
                  src={aboutImage}
                  alt={designerName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Floating Status Badge */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{availability}</span>
                </div>
              </div>

              {/* Bottom Quick Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{designerName}</h4>
                    <p className="text-xs text-teal-400 font-semibold">{designerTitle}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
                    Remote 🌐
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>📍 {location.split('(')[0]}</span>
                  <span className="text-zinc-300 font-bold">{languagesStr}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. WHY BRANDS PARTNER WITH SAKHAWAT (Dynamic Pillars)
            ========================================================================= */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Design Standards</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-display text-white">
              Why Brands & Agencies Choose To Work With Me
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Clear deliverables, commercial licenses, and zero guesswork from concept to final release.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {philosophyPillars.map((pillar, idx) => {
              const Icon = resolvePillarIcon(pillar.icon);
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between space-y-4 group hover:shadow-xl hover:shadow-teal-950/20"
                >
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 text-[11px] font-semibold text-teal-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Guaranteed Standard</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            3. CORE DESIGN DISCIPLINES (Connecting to Services & Portfolio)
            ========================================================================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-zinc-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Expert Capabilities</span>
              </div>
              <h2 className="text-3xl font-black font-display text-white">
                Core Design Disciplines
              </h2>
            </div>

            <Link
              to="/services"
              className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>Explore All 4 Services & Pricing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CORE_DISCIPLINES.map((disc, idx) => {
              const Icon = disc.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800/80 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-teal-400 flex items-center justify-center shrink-0 group-hover:border-teal-500/40 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                        {disc.title}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {disc.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-xs font-semibold">
                    <Link
                      to={disc.portfolioLink}
                      className="text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <span>View Works Slider 🖼️</span>
                    </Link>
                    <Link
                      to={disc.link}
                      className="text-zinc-300 hover:text-white flex items-center gap-1"
                    >
                      <span>Service Scope & Packages</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            4. VERIFIED CAREER TRACK RECORD & AGENCY EXPERIENCE (Dynamic CMS)
            ========================================================================= */}
        <div className="space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Track Record</span>
            </div>
            <h2 className="text-3xl font-black font-display text-white">
              Work Experience & Agency Roles
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Direct design contributions across e-commerce brands, IT training institutes, and international digital teams.
            </p>
          </div>

          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-teal-500/40 transition-colors shadow-md"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-teal-400 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                      {exp.period}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">📍 {exp.location}</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">{exp.role}</h3>
                  <h4 className="text-xs font-bold text-teal-300">{exp.company}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed pt-1">{exp.desc}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 md:flex-col md:items-end shrink-0">
                  {Array.isArray(exp.tags) &&
                    exp.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800"
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            5. MASTER SOFTWARE & PRODUCTION TOOLCHAIN (Dynamic CMS)
            ========================================================================= */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5" />
              <span>Tool Mastery</span>
            </div>
            <h2 className="text-3xl font-black font-display text-white">
              Software Stack & Technical Toolkit
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Industry-standard software stack leveraged for rapid turnarounds and pristine master vector/video exports.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {toolchain.map((tool, idx) => {
              const ToolIcon = resolveToolIcon(tool);
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/80 space-y-3 hover:border-teal-500/40 transition-all flex flex-col justify-between group hover:shadow-xl hover:shadow-teal-950/20"
                >
                  <div className="flex items-center gap-3.5">
                    <ToolIcon />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors truncate">
                          {tool.name}
                        </h3>
                        <span className="text-xs font-mono font-bold text-teal-400 shrink-0">
                          {tool.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug line-clamp-1 mt-0.5">
                        {tool.category}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: tool.level }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            6. BOTTOM DIRECT CALL TO ACTION (Dynamic CMS)
            ========================================================================= */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-teal-950/80 via-zinc-950 to-teal-950/80 border border-teal-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black font-display text-white">
              {ctaHeading}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
              {ctaSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link to="/book-a-meeting">
              <Button variant="primary" size="lg" icon={Calendar} className="font-black px-8">
                Book a Strategy Call
              </Button>
            </Link>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="lg" icon={MessageCircle} className="text-emerald-400 border-emerald-500/40">
                WhatsApp: {whatsappNum}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
