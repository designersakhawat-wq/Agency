import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  FileCheck,
  HelpCircle,
  FolderKanban,
  Clock,
  RefreshCw,
  Palette,
  Megaphone,
  Video,
  Layout,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import FaqAccordion from '../../components/home/FaqAccordion';

const iconMap = {
  Palette: Palette,
  Megaphone: Megaphone,
  Video: Video,
  Layout: Layout,
};

const processSteps = [
  {
    step: '01',
    title: 'Creative Consultation',
    desc: 'We discuss your brand identity, target demographic, campaign goals, and aesthetic benchmarks.',
  },
  {
    step: '02',
    title: 'Requirement & Asset Gathering',
    desc: 'Collection of product images, typography guidelines, copy hooks, and dimensional format requirements.',
  },
  {
    step: '03',
    title: 'Art Direction & Drafting',
    desc: 'Developing initial design concepts with strong visual hierarchy, contrast framing, and psychology.',
  },
  {
    step: '04',
    title: 'Review & Collaborative Revision',
    desc: 'Refining details, color balance, and layouts based on your feedback until the design is approved.',
  },
  {
    step: '05',
    title: 'Final Export & Delivery',
    desc: 'Preparation of organized vector source files (.AI, .PSD), web exports, and commercial usage release.',
  },
];

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/services/${slug}`);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError('Service not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  if (loading) {
    return <Loader message="Loading service details..." fullScreen />;
  }

  if (error || !data?.service) {
    return (
      <div className="pt-36 pb-24 min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Service Not Found</h2>
        <p className="text-xs text-zinc-400 mb-6">The requested service page does not exist.</p>
        <Link to="/services">
          <Button variant="primary" size="md">
            View All Services
          </Button>
        </Link>
      </div>
    );
  }

  const { service, projects, faqs } = data;
  const ServiceIcon = iconMap[service.icon] || Palette;
  const packages = service.packages || [];
  const features = Array.isArray(service.features) ? service.features : [];
  const deliverables = Array.isArray(service.deliverables) ? service.deliverables : [];

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="ambient-glow-teal top-20 right-1/4 opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
        {/* 1. Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Creative Graphic Design Service
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight leading-tight">
              {service.title}
            </h1>

            {service.tagline && (
              <p className="text-lg sm:text-xl font-medium text-teal-300">
                {service.tagline}
              </p>
            )}

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
              {service.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/book-a-meeting">
                <Button variant="primary" size="lg" icon={Calendar}>
                  Book a Meeting
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="secondary" size="lg" icon={ArrowRight} iconPosition="right">
                  View Portfolio
                </Button>
              </Link>
            </div>

            {/* Trust Statement */}
            <div className="flex items-center gap-4 pt-4 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>3+ Years Experience</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <span>International Remote Clients (USA, Dubai, BD)</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-3xl glass-card border border-teal-500/20 space-y-6 shadow-2xl relative">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <ServiceIcon className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold font-display text-white">
                What this service includes:
              </h3>

              <div className="space-y-3">
                {features.map((f, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Deliverables Grid */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="brand" size="md">
              Guaranteed Deliverables
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
              What You Receive Upon Completion
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Every deliverable is crafted for high resolution, proper format compliance, and full commercial readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {deliverables.map((deliv, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl glass-card border border-zinc-800 hover:border-teal-500/40 transition-colors space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-base">{deliv}</h4>
                <p className="text-xs text-zinc-400">
                  Formatted and structured for seamless brand deployment across web and print.
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Pricing Packages (Exactly 3 Packages: Basic, Standard, Premium) */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="brand" size="md">
              Transparent Investment
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
              Flexible Packages for Every Scale
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Select an initial package or request a tailored scope for your specific brand campaign.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => {
              let pkgFeatures = pkg.features;
              if (typeof pkgFeatures === 'string') {
                try {
                  pkgFeatures = JSON.parse(pkgFeatures);
                } catch (e) {
                  pkgFeatures = [];
                }
              }

              return (
                <div
                  key={pkg.id}
                  className={`p-8 rounded-3xl flex flex-col justify-between relative transition-all duration-300 ${
                    pkg.isPopular
                      ? 'glass-card border-2 border-teal-500/60 shadow-2xl shadow-teal-950/40'
                      : 'glass-card border border-zinc-800'
                  }`}
                >
                  {pkg.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="px-3.5 py-1 rounded-full bg-teal-500 text-white font-bold text-[11px] uppercase tracking-wider shadow-md">
                        Most Popular Choice
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold font-display text-white mb-2">{pkg.name}</h3>
                    <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{pkg.description}</p>

                    <div className="mb-6 pb-6 border-b border-zinc-800">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black font-display text-white">
                          ${pkg.price}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          /{pkg.billingPeriod || 'project'}
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-3 mb-8">
                      {Array.isArray(pkgFeatures) &&
                        pkgFeatures.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feat}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Link to="/book-a-meeting" className="block w-full">
                    <Button
                      variant={pkg.isPopular ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full"
                    >
                      {pkg.ctaText || 'Select Package'}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Creative Workflow Process */}
        <div className="p-8 sm:p-12 rounded-3xl glass-card border border-zinc-800 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="brand" size="md">
              Methodology
            </Badge>
            <h2 className="text-3xl font-display font-black text-white">
              How We Bring Your Vision to Life
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              A structured 5-step collaborative workflow ensuring transparency, speed, and creative precision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {processSteps.map((p, idx) => (
              <div key={idx} className="space-y-2 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-2xl font-black font-display text-teal-400 block font-mono">
                  {p.step}
                </span>
                <h4 className="text-sm font-bold text-white">{p.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Service-Specific Portfolio Projects */}
        {projects && projects.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <Badge variant="brand" size="md">
                  Case Studies
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-display font-black text-white mt-1">
                  Selected Work in {service.title}
                </h2>
              </div>
              <Link to="/portfolio">
                <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                  View Full Portfolio
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/portfolio/${proj.slug}`}
                  className="group rounded-2xl glass-card border border-zinc-800 overflow-hidden hover:border-teal-500/40 transition-colors"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-zinc-900 relative">
                    <img
                      src={proj.coverImage}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider">
                      {proj.category}
                    </span>
                    <h3 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2">{proj.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 6. Service-Specific FAQs */}
        <FaqAccordion faqs={faqs} />

        {/* 7. Final Call to Action */}
        <div className="p-8 sm:p-14 rounded-3xl glass-card border border-teal-500/30 text-center space-y-6 relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-teal-950/40">
          <div className="ambient-glow-teal top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
              Have a Project in Mind?
            </h2>
            <p className="text-sm sm:text-base text-zinc-300">
              Let's create something that gets noticed, builds brand authority, and converts viewers into paying clients.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link to="/book-a-meeting">
                <Button variant="primary" size="lg" icon={Calendar}>
                  Book a Meeting
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">
                  Start a Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
