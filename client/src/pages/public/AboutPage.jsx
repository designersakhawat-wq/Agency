import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  Palette,
  Megaphone,
  Video,
  Layout,
  GraduationCap,
  Briefcase,
  Globe,
  Wrench,
} from 'lucide-react';
import Button from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

const AboutPage = () => {
  const experiences = [
    {
      company: 'e-Learn IT Institute',
      role: 'Senior Ruffles Designer',
      period: 'Recent / Current',
      location: 'Bangladesh (Remote)',
      desc: 'Leading promotional creative direction, team management, marketing campaign assets, and course enrollment banners with high visual impact.',
    },
    {
      company: 'Optiva Max',
      role: 'Senior Graphic Designer',
      period: 'Previous',
      location: 'Dubai (Remote)',
      desc: 'Designed high-converting website product images, digital storefront branding, and sales-driven advertising creatives for tech clients.',
    },
    {
      company: 'ORA Organic',
      role: 'Senior Graphics Designer',
      period: 'Previous',
      location: 'Dubai',
      desc: 'Crafted premium wellness product visual framing, ingredient benefit carousels, and performance Meta ad creatives resulting in a 42% ROAS increase.',
    },
    {
      company: 'Advanced Digital Automotive',
      role: 'Independent Graphic Designer & AI Video Editor',
      period: 'Previous',
      location: 'USA (Remote)',
      desc: 'Produced high-contrast YouTube thumbnails, print marketing collateral, brand guidelines, and AI-assisted short-form video edits.',
    },
    {
      company: 'Kenakata Shop',
      role: 'Graphics Designer',
      period: 'Previous',
      location: 'Bangladesh',
      desc: 'Developed gadget and lifestyle e-commerce visual communications, product badge overlays, and social media promotional posts.',
    },
  ];

  const skillList = [
    'Social Media Post Design',
    'Facebook & Instagram Ad Creative',
    'Branding & Visual Identity',
    'Logo Design',
    'E-commerce Product Design',
    'Banner & Header Branding',
    'YouTube Thumbnail Design',
    'Product Packaging & Label Design',
    'Photo Manipulation & Retouching',
    'UGC & Short-Form Video Editing',
    'AI-Assisted Creative Design',
    'Print Media & Stationery Design',
  ];

  const toolchain = [
    { name: 'Adobe Photoshop', category: 'Graphic Design & Retouching' },
    { name: 'Adobe Illustrator', category: 'Vector Branding & Logos' },
    { name: 'Adobe Premiere Pro', category: 'Video Editing & Pacing' },
    { name: 'Adobe After Effects', category: 'Motion Graphics & Titles' },
    { name: 'Figma', category: 'UI & Asset Design System' },
    { name: 'Canva Pro', category: 'Rapid Social Templates' },
    { name: 'CapCut', category: 'Dynamic UGC Captions' },
    { name: 'ChatGPT & AI Tools', category: 'Creative Ideation & Copy Hooks' },
    { name: 'ClickUp & Discord', category: 'Project Management & Collab' },
  ];

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="ambient-glow-teal top-24 left-1/4 opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
        {/* 1. Bio Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              About Md Sakhawat Hossain
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight leading-tight">
              Designing with Marketing Psychology & Visual Precision
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 leading-relaxed">
              I am a professional Creative Graphic Designer with 3+ years of hands-on experience helping brands across Bangladesh, Dubai, and the United States stand out, look authoritative, and sell better.
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              I don't just make graphics that look visually appealing — I design with an acute understanding of brand communication, consumer attention spans, advertising conversion funnels, and e-commerce presentation.
            </p>

            {/* Quick Personal Attributes */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Location:</span>
                <span className="text-white font-bold">Ishurdi, Pabna, Bangladesh</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Languages:</span>
                <span className="text-white font-bold">Bangla, English, Hindi</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Availability:</span>
                <span className="text-teal-400 font-bold">Immediate (Remote Worldwide)</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-500 block mb-0.5">Experience:</span>
                <span className="text-white font-bold">3+ Years Professional</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link to="/book-a-meeting">
                <Button variant="primary" size="md" icon={Calendar}>
                  Book a Consultation
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="outline" size="md" icon={ArrowUpRight} iconPosition="right">
                  Explore Portfolio
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden glass-card p-3 border border-zinc-800 shadow-2xl">
              <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                  alt="Md Sakhawat Hossain"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl glass-card border border-teal-500/30 backdrop-blur-xl">
                <h4 className="text-sm font-bold text-white">Md Sakhawat Hossain</h4>
                <p className="text-xs text-teal-400 font-medium">Creative Graphic Designer</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Education Card */}
        <div className="p-8 rounded-3xl glass-card border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">
                Formal Academic Background
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Computer Engineering / Computer Science
              </h3>
              <p className="text-xs text-zinc-400">Rajshahi Polytechnic Institute</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <Badge variant="brand" size="md">
              Passing Year: 2020
            </Badge>
            <span className="text-xs text-zinc-400 block mt-1">CGPA: 3.32</span>
          </div>
        </div>

        {/* 3. Verified Career History */}
        <div className="space-y-8">
          <div className="space-y-2">
            <Badge variant="brand" size="md">
              Career Journey
            </Badge>
            <h2 className="text-3xl font-display font-black text-white">
              Work Experience & Agency Track Record
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Direct contributions across e-commerce brands, IT training institutes, and international digital agencies.
            </p>
          </div>

          <div className="space-y-5">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-teal-500/40 transition-colors"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-400">
                      {exp.period}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-400">{exp.location}</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">{exp.role}</h3>
                  <h4 className="text-xs font-semibold text-zinc-300">{exp.company}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed pt-2">{exp.desc}</p>
                </div>
                <div className="shrink-0">
                  <Badge variant="brand" size="sm">
                    Verified Experience
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Skills & Tools Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Creative Skills */}
          <div className="p-8 rounded-3xl glass-card border border-zinc-800 space-y-6">
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-teal-400" />
              <h3 className="text-xl font-bold font-display text-white">Creative Design Skills</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {skillList.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-zinc-300 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Software & Toolchain */}
          <div className="p-8 rounded-3xl glass-card border border-zinc-800 space-y-6">
            <div className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-teal-400" />
              <h3 className="text-xl font-bold font-display text-white">Software & Toolchain</h3>
            </div>
            <div className="space-y-2.5">
              {toolchain.map((tool, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs"
                >
                  <span className="font-bold text-white">{tool.name}</span>
                  <span className="text-zinc-400 text-[11px]">{tool.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Bottom Call to Action */}
        <div className="p-8 sm:p-12 rounded-3xl glass-card border border-teal-500/30 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
            Let's Collaborate on Your Next Brand Campaign
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Available immediately for freelance contracts, monthly agency retainers, and e-commerce creative overhauls.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/book-a-meeting">
              <Button variant="primary" size="lg" icon={Calendar}>
                Book a Meeting
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Send a Message
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
