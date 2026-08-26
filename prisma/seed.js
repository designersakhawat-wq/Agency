const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding for Md Sakhawat Hossain...');

  // 1. Admin User
  const adminEmail = 'admin@sakhawat.design';
  const hashedPassword = await bcrypt.hash('admin123456', 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Md Sakhawat Hossain',
        role: 'ADMIN',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      },
    });
    console.log('✅ Admin user created: admin@sakhawat.design');
  }

  // 2. Site Settings
  const siteSettings = [
    { key: 'site_title', value: 'Md Sakhawat Hossain — Creative Graphic Designer' },
    { key: 'site_description', value: 'Professional Creative Graphic Designer with 3+ years experience specializing in Logo & Branding, Ads Creative, E-commerce, UGC Video, and Cover Branding.' },
    { key: 'designer_name', value: 'Md Sakhawat Hossain' },
    { key: 'designer_title', value: 'Creative Graphic Designer' },
    { key: 'contact_email', value: 'designersakhawat@gmail.com' },
    { key: 'contact_phone', value: '01781955355' },
    { key: 'contact_location', value: 'Ishurdi, Pabna, Rajshahi, Bangladesh' },
    { key: 'years_experience', value: '3+' },
    { key: 'availability_status', value: 'Immediately Available for Remote Projects' },
    { key: 'hero_badge', value: 'Available for Remote Creative Contracts' },
    { key: 'hero_title', value: 'Creative Graphic Designer Helping Brands Stand Out, Sell Better, and Look Professional.' },
    { key: 'hero_subtitle', value: 'Specializing in high-converting advertising creatives, memorable brand identities, e-commerce product design, and dynamic UGC video content.' },
    {
      key: 'social_links',
      value: JSON.stringify({
        linkedin: 'https://www.linkedin.com/in/designersakhawat/',
        behance: 'https://www.behance.net/sakhawatdesigner',
        website: 'https://designersakhawat.com/',
        facebook: 'https://facebook.com/designersakhawat',
        instagram: 'https://instagram.com/designersakhawat',
      }),
    },
    {
      key: 'education',
      value: JSON.stringify({
        degree: 'Diploma in Computer Engineering / Computer Science',
        institution: 'Rajshahi Polytechnic Institute',
        passingYear: '2020',
        cgpa: '3.32',
      }),
    },
  ];

  for (const s of siteSettings) {
    const existing = await prisma.siteSetting.findUnique({ where: { key: s.key } });
    if (!existing) {
      await prisma.siteSetting.create({ data: s });
    }
  }
  console.log('✅ Site settings seeded.');

  // 3. Clear and seed Core Services (Exactly 4 Core Services)
  // Let's check existing services and upsert
  const servicesData = [
    {
      slug: 'logo-branding',
      title: 'Logo & Branding',
      tagline: 'Distinctive visual identities that command trust and recognition',
      icon: 'Palette',
      description:
        'End-to-end brand identity systems including primary and secondary logos, comprehensive brand style guidelines, color palettes, typography pairings, and ready-to-use vector assets tailored for your industry.',
      features: JSON.stringify([
        'Original Vector Logo Design (AI, EPS, SVG, PNG)',
        'Comprehensive Brand Style Guide & Usage Rules',
        'Curated Color Hierarchy & Typography System',
        'Social Media Profile & Banner Brand Pack',
        'Favicon & Brand Icon Assets',
        'Full Commercial Rights & Ownership Transfer',
      ]),
      deliverables: JSON.stringify([
        'Master Vector Source Files (.AI, .EPS)',
        'Print-Ready & Web-Optimized Asset Exports',
        'Full Color, Monochrome & Inverted Logo Variations',
        'Digital Brand Guidelines PDF Document',
      ]),
      order: 1,
      active: true,
      packages: [
        {
          name: 'Basic Logo Identity',
          price: 149,
          billingPeriod: 'per-project',
          description: 'Essential vector logo package ideal for early-stage startups and personal brands.',
          features: JSON.stringify([
            '2 Initial Logo Concepts',
            '3 Iterative Revision Rounds',
            'High-Resolution PNG & JPEG (Transparent)',
            'Vector Source Files (.AI, .EPS)',
            '3 Business Days Delivery',
          ]),
          isPopular: false,
          order: 1,
          ctaText: 'Start Logo Project',
        },
        {
          name: 'Standard Brand Suite',
          price: 299,
          billingPeriod: 'per-project',
          description: 'Complete visual identity package with color systems, typography, and social branding.',
          features: JSON.stringify([
            '3 Distinct Custom Concepts',
            'Unlimited Revisions during drafting',
            'Complete Brand Guidelines Document (PDF)',
            'Color Palette & Font System Tokens',
            'Social Media Kit (Avatar + Covers)',
            'Full Commercial Rights',
            '5 Business Days Delivery',
          ]),
          isPopular: true,
          order: 2,
          ctaText: 'Book Brand Suite',
        },
        {
          name: 'Premium Enterprise Branding',
          price: 599,
          billingPeriod: 'per-project',
          description: 'Full-scale corporate identity and stationery collateral for scaling enterprises.',
          features: JSON.stringify([
            '5 Premium Concepts with Art Direction',
            'Unlimited Design Revisions',
            'Master Brand Book & Design System',
            'Complete Stationery (Business Card, Letterhead)',
            '3D Mockups & Marketing Display Assets',
            'Priority 1-on-1 Dedicated Support',
            '7 Business Days Delivery',
          ]),
          isPopular: false,
          order: 3,
          ctaText: 'Get Enterprise Branding',
        },
      ],
    },
    {
      slug: 'ads-creative',
      title: 'Ads Creative',
      tagline: 'High-converting social advertising designs engineered for sales',
      icon: 'Megaphone',
      description:
        'Strategic promotional creatives for Meta (Facebook & Instagram), TikTok, and Google Ads. Designed with psychological triggers, compelling hooks, and clear calls-to-action to lower CPA and maximize ROAS.',
      features: JSON.stringify([
        'Sales-Driven Static Ad Banners & Carousels',
        'Meta (1:1 Feed & 9:16 Story/Reels) Formats',
        'A/B Testing Creative Variations (Hooks & Layouts)',
        'Engaging Typography & High-Impact Copy Layout',
        'Product Cutouts & Professional Retouching',
        'Optimized for High Click-Through Rates (CTR)',
      ]),
      deliverables: JSON.stringify([
        'High-Resolution Ad Creatives (1080x1080, 1080x1920)',
        'Editable Source Files (.PSD / Figma)',
        'Platform-Compliant Formats with zero text penalty',
      ]),
      order: 2,
      active: true,
      packages: [
        {
          name: 'Starter Ads Pack',
          price: 99,
          billingPeriod: 'per-project',
          description: 'Ideal for testing a new campaign hook or promoting a seasonal sale.',
          features: JSON.stringify([
            '3 High-Converting Ad Creatives',
            'Feed (1:1) & Story (9:16) Formats',
            '2 Revision Rounds per creative',
            'Source Files Included (.PSD)',
            '2 Business Days Delivery',
          ]),
          isPopular: false,
          order: 1,
          ctaText: 'Order Starter Ads',
        },
        {
          name: 'Growth Campaign Bundle',
          price: 199,
          billingPeriod: 'per-project',
          description: 'Comprehensive creative suite for ongoing paid advertising campaigns.',
          features: JSON.stringify([
            '8 Custom Ad Creatives / Carousels',
            'A/B Testing Variations (Hooks + Visuals)',
            'Full Feed + Story + Banner Dimensions',
            'Unlimited Revision Cycles',
            'Commercial Usage Included',
            '3 Business Days Delivery',
          ]),
          isPopular: true,
          order: 2,
          ctaText: 'Scale Paid Ads',
        },
        {
          name: 'Scale & Retargeting Suite',
          price: 399,
          billingPeriod: 'per-project',
          description: 'Full monthly creative asset pipeline for aggressive e-commerce growth.',
          features: JSON.stringify([
            '18 High-Impact Creatives (Feed, Carousel, Story)',
            'Dedicated Campaign Art Direction',
            'Competitor & Audience Visual Research',
            'Rapid 24-48hr Turnaround Priority',
            'Ongoing Weekly Creative Refreshes',
          ]),
          isPopular: false,
          order: 3,
          ctaText: 'Book Growth Suite',
        },
      ],
    },
    {
      slug: 'ugc-video',
      title: 'UGC Video',
      tagline: 'Authentic short-form video content designed for TikTok & Reels',
      icon: 'Video',
      description:
        'Dynamic user-generated content (UGC) and short-form video editing for TikTok, Instagram Reels, and YouTube Shorts. Crafted with fast pacing, captivating captions, motion graphics, and sound design to hook viewers in the first 3 seconds.',
      features: JSON.stringify([
        'Scroll-Stopping 3-Second Visual Hooks',
        'Engaging Animated Captions & Subtitles',
        'Sound Effects, Voiceover Sync & Audio Leveling',
        'B-Roll Stitching & Dynamic Transitions',
        'AI-Assisted Video Enhancement & Color Grading',
        'Format Optimization for TikTok, Reels & Shorts (9:16)',
      ]),
      deliverables: JSON.stringify([
        'Full HD 1080x1920 MP4 Video Files',
        'Vertical Formats Optimized for Mobile Feeds',
        'Thumbnail Covers Included',
      ]),
      order: 3,
      active: true,
      packages: [
        {
          name: 'Single UGC Video',
          price: 149,
          billingPeriod: 'per-project',
          description: '1 polished 15-45s vertical video ready for ad campaigns or organic posting.',
          features: JSON.stringify([
            '1 Short-Form Video (Up to 45s)',
            'Engaging Animated Dynamic Captions',
            'Sound Effects & Licensed Music Sync',
            '2 Revision Rounds',
            '2 Business Days Delivery',
          ]),
          isPopular: false,
          order: 1,
          ctaText: 'Order Single Video',
        },
        {
          name: 'Viral Tri-Pack',
          price: 299,
          billingPeriod: 'per-project',
          description: '3 high-converting short-form videos with varying hook angles for A/B testing.',
          features: JSON.stringify([
            '3 Distinct Videos (15-60s each)',
            '3 Different Hook Openings per video',
            'Animated Emojis, B-Roll & Visual Pop-ups',
            'Unlimited Revisions',
            'Custom Click-Worthy Cover Thumbnails',
            '4 Business Days Delivery',
          ]),
          isPopular: true,
          order: 2,
          ctaText: 'Book Viral Tri-Pack',
        },
        {
          name: 'Monthly Content Retainer',
          price: 549,
          billingPeriod: 'per-month',
          description: 'Complete video content pipeline with 8 ready-to-publish videos each month.',
          features: JSON.stringify([
            '8 Short-Form Videos Monthly',
            'Hook & Script Consultation Support',
            'Fast 48-Hour Turnaround Times',
            'Full Commercial Audio & Visual Rights',
            'Priority Dedicated Video Editor Queue',
          ]),
          isPopular: false,
          order: 3,
          ctaText: 'Start Video Retainer',
        },
      ],
    },
    {
      slug: 'cover-branding',
      title: 'Cover Branding',
      tagline: 'Professional social banners, YouTube covers, and digital storefront graphics',
      icon: 'Layout',
      description:
        'Custom digital header and banner branding for LinkedIn, Facebook Pages, YouTube Channels, Twitter/X, and E-commerce storefronts. Aligns your brand across every touchpoint to convey authority and trust.',
      features: JSON.stringify([
        'Custom Responsive Banners (Desktop + Mobile Safe Zones)',
        'LinkedIn Personal & Company Page Headers',
        'YouTube Channel Art & Podcast Cover Design',
        'Facebook Page, Group & Event Covers',
        'E-commerce Storefront Banners (Shopify, Daraz, Amazon)',
        'Consistent Brand Color & Typography Integration',
      ]),
      deliverables: JSON.stringify([
        'Multi-Platform Dimension-Ready Graphics',
        'Editable PSD / Figma Master Source Files',
        'Crisp, Lossless PNG Files',
      ]),
      order: 4,
      active: true,
      packages: [
        {
          name: 'Single Platform Cover',
          price: 79,
          billingPeriod: 'per-project',
          description: '1 high-impact cover header tailored for LinkedIn, YouTube, or Facebook.',
          features: JSON.stringify([
            '1 Custom Banner Header',
            'Mobile & Desktop Safe Zone Optimization',
            'Matching Profile Avatar Accent',
            '2 Revision Rounds',
            '2 Business Days Delivery',
          ]),
          isPopular: false,
          order: 1,
          ctaText: 'Get Single Cover',
        },
        {
          name: 'Multi-Channel Brand Pack',
          price: 149,
          billingPeriod: 'per-project',
          description: 'Consistent branding across your 3 most critical digital channels.',
          features: JSON.stringify([
            '3 Platform Covers (e.g. LinkedIn + YouTube + FB)',
            'Cohesive Visual Styling & Messaging',
            'Matching Profile Pictures / Avatars',
            'Unlimited Design Revisions',
            'Full Source Files (.PSD / Figma)',
            '3 Business Days Delivery',
          ]),
          isPopular: true,
          order: 2,
          ctaText: 'Brand All Channels',
        },
        {
          name: 'Full Digital Presence Overhaul',
          price: 249,
          billingPeriod: 'per-project',
          description: 'Complete cross-platform header suite for business profiles and e-commerce stores.',
          features: JSON.stringify([
            '6 Platform Banners + Storefront Headers',
            '3 Custom Click-Worthy Thumbnail Templates',
            'Lead Magnet Promo Banner Variations',
            'Complete Vector Source Package',
            'Priority 48hr Delivery',
          ]),
          isPopular: false,
          order: 3,
          ctaText: 'Overhaul Brand Graphics',
        },
      ],
    },
  ];

  for (const sData of servicesData) {
    const { packages, ...serviceFields } = sData;

    let service = await prisma.service.findUnique({ where: { slug: serviceFields.slug } });
    if (!service) {
      service = await prisma.service.create({ data: serviceFields });
    }

    // Create packages for this service if not already existing
    if (packages && packages.length > 0) {
      for (const p of packages) {
        const existingPkg = await prisma.package.findFirst({
          where: { serviceId: service.id, name: p.name },
        });
        if (!existingPkg) {
          await prisma.package.create({
            data: { ...p, serviceId: service.id },
          });
        }
      }
    }
  }
  console.log('✅ 4 Core Services and tiered Packages seeded.');

  // 4. Partner Brands & Client Logos (e-Learn IT, Advanced Digital Automotive, Optiva Max, ORA Organic, Kenakata Shop)
  const clientBrands = [
    {
      name: 'e-Learn IT Institute',
      websiteUrl: 'https://elearnitinstitute.com/',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&auto=format&fit=crop&q=80',
      order: 1,
      active: true,
    },
    {
      name: 'Advanced Digital Automotive',
      websiteUrl: 'https://advanceddigitalauto.com',
      logoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=300&auto=format&fit=crop&q=80',
      order: 2,
      active: true,
    },
    {
      name: 'Optiva Max (Dubai)',
      websiteUrl: 'https://optivamax.com',
      logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&auto=format&fit=crop&q=80',
      order: 3,
      active: true,
    },
    {
      name: 'ORA Organic (Dubai)',
      websiteUrl: 'https://oraorganic.com',
      logoUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=300&auto=format&fit=crop&q=80',
      order: 4,
      active: true,
    },
    {
      name: 'Kenakata Shop',
      websiteUrl: 'https://kenakatashop.com',
      logoUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&auto=format&fit=crop&q=80',
      order: 5,
      active: true,
    },
  ];

  for (const b of clientBrands) {
    const existing = await prisma.clientBrand.findFirst({ where: { name: b.name } });
    if (!existing) {
      await prisma.clientBrand.create({ data: b });
    }
  }
  console.log('✅ Client brands seeded.');

  // 5. Portfolio Projects (Graphic Design, Ads Creative, E-commerce, UGC Video, Branding)
  const portfolioProjects = [
    {
      title: 'ORA Organic — Sales-Driven E-Commerce Product & Ads Campaign',
      slug: 'ora-organic-ecommerce-ads',
      category: 'Ads Creative',
      client: 'ORA Organic (Dubai)',
      year: '2024',
      summary: 'High-converting social media advertising creatives and website product image designs for a premium wellness brand in Dubai.',
      description:
        'Crafted a cohesive visual advertising campaign for ORA Organic, focusing on clean ingredient transparency, lifestyle product framing, and high-impact Meta carousel ads that drove a 42% increase in sales conversions.',
      coverImage: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
      galleryImages: JSON.stringify([
        'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1000&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80',
      ]),
      tags: JSON.stringify(['Photoshop', 'Illustrator', 'Ads Creative', 'E-Commerce', 'Product Framing']),
      challenges: 'High ad fatigue and rising customer acquisition costs on Meta channels.',
      solutions: 'Engineered contrast-rich product benefit carousels with punchy typography hooks and clear value callouts.',
      results: '+42% conversion rate increase and lower cost-per-purchase across Instagram ad placements.',
      featured: true,
      order: 1,
      active: true,
    },
    {
      title: 'e-Learn IT Institute — Brand Identity & Digital Promotional Suite',
      slug: 'elearn-it-institute-branding',
      category: 'Logo & Branding',
      client: 'e-Learn IT Institute',
      year: '2024',
      summary: 'Complete brand identity refresh, social media marketing templates, and promotional banners for an IT educational institute.',
      description:
        'Led the visual rebranding for e-Learn IT Institute, delivering an authoritative tech-focused logo mark, consistent course enrollment banners, and structured promotional materials used across digital campaigns.',
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
      galleryImages: JSON.stringify([
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
      ]),
      tags: JSON.stringify(['Branding', 'Logo Design', 'Illustrator', 'Marketing Creatives', 'Education']),
      challenges: 'Inconsistent branding across different course marketing channels.',
      solutions: 'Created a unified brand guidelines system with flexible banner templates for rapid course promotions.',
      results: 'Boosted brand recall and unified all digital assets across 12+ tech courses.',
      featured: true,
      order: 2,
      active: true,
    },
    {
      title: 'Kenakata Shop — Gadget & Lifestyle E-Commerce Creative Suite',
      slug: 'kenakata-shop-gadget-design',
      category: 'E-commerce',
      client: 'Kenakata Shop',
      year: '2023',
      summary: 'Modern lifestyle product presentations and promotional feed creatives for a consumer electronics store.',
      description:
        'Designed high-definition e-commerce product badges, lifestyle feature breakdown graphics, and promotional event banners that highlighted gadget specs in an easily digestible visual format.',
      coverImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80',
      galleryImages: JSON.stringify([
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1000&auto=format&fit=crop&q=80',
      ]),
      tags: JSON.stringify(['E-commerce', 'Photoshop', 'Gadget Design', 'Lifestyle Visuals', 'Retouching']),
      challenges: 'Complex tech specifications were confusing customers on product pages.',
      solutions: 'Transformed spec sheets into visual infographics and high-converting product thumbnails.',
      results: 'Increased average time on page and boosted checkout conversions on featured gadget lines.',
      featured: true,
      order: 3,
      active: true,
    },
    {
      title: 'Advanced Digital Automotive — AI Video & High-Impact Social Creatives',
      slug: 'advanced-digital-automotive-video',
      category: 'UGC Video',
      client: 'Advanced Digital Automotive (USA)',
      year: '2023',
      summary: 'AI-assisted video editing, YouTube thumbnails, and automotive promotional branding for a US automotive client.',
      description:
        'Produced energetic short-form video edits and eye-catching YouTube thumbnail packaging that significantly enhanced click-through rates across video marketing channels.',
      coverImage: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&auto=format&fit=crop&q=80',
      galleryImages: JSON.stringify([
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000&auto=format&fit=crop&q=80',
      ]),
      tags: JSON.stringify(['UGC Video', 'Premiere Pro', 'After Effects', 'AI Video', 'Thumbnails']),
      challenges: 'Low retention and weak CTR on video ad campaigns.',
      solutions: 'Implemented high-contrast thumbnail compositions and dynamic 3-second hook pacing.',
      results: 'Achieved 2.8x higher CTR on YouTube video series and improved social ad engagement.',
      featured: true,
      order: 4,
      active: true,
    },
    {
      title: 'Optiva Max — Multi-Platform Cover Branding & Marketing Kit',
      slug: 'optiva-max-cover-branding',
      category: 'Cover Branding',
      client: 'Optiva Max (Dubai)',
      year: '2024',
      summary: 'Corporate digital header suite, LinkedIn banners, and promotional advertising collateral for a tech company in Dubai.',
      description:
        'Developed an executive cover branding kit across LinkedIn, Facebook, and storefront channels that cemented brand trust and established an authoritative digital presence.',
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      galleryImages: JSON.stringify([
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
      ]),
      tags: JSON.stringify(['Cover Branding', 'Banner Design', 'Photoshop', 'LinkedIn Branding', 'B2B']),
      challenges: 'Outdated header banners did not reflect the modern capabilities of the company.',
      solutions: 'Designed sleek, typography-forward banners optimized for both desktop and mobile viewports.',
      results: 'Unified digital branding across executive and corporate profiles.',
      featured: false,
      order: 5,
      active: true,
    },
  ];

  for (const p of portfolioProjects) {
    const existing = await prisma.project.findUnique({ where: { slug: p.slug } });
    if (!existing) {
      await prisma.project.create({ data: p });
    }
  }
  console.log('✅ Verified portfolio projects seeded.');

  // 6. FAQs (Service-specific and general)
  const faqsData = [
    {
      category: 'General',
      question: 'What source files and formats do you deliver upon project completion?',
      answer: 'Depending on the service, you receive fully organized master vector files (.AI, .EPS), editable layered files (.PSD or Figma), high-resolution web-ready PNGs (with transparent backgrounds), JPEGs, and print-ready PDFs with full commercial rights.',
      order: 1,
      active: true,
    },
    {
      category: 'Process',
      question: 'How does your creative design and revision workflow work?',
      answer: 'We begin with a thorough creative consultation to understand your brand goals and audience. Next, I develop initial concepts for your review. We then refine the chosen direction through collaborative revision rounds before preparing final export packages.',
      order: 2,
      active: true,
    },
    {
      category: 'Pricing',
      question: 'Can I request a custom package tailored to my exact business needs?',
      answer: 'Yes! While I offer transparent tiered packages for Logo & Branding, Ads Creative, UGC Video, and Cover Branding, I frequently tailor custom scopes for monthly retainers and multi-platform campaign launches. Use the "Book a Meeting" form to discuss your scope.',
      order: 3,
      active: true,
    },
    {
      category: 'Deliverables',
      question: 'How fast is the turnaround time for ads and video creatives?',
      answer: 'Standard ad creatives and single UGC videos are typically delivered within 2 to 3 business days. Rush delivery is also available upon request for time-sensitive marketing campaigns.',
      order: 4,
      active: true,
    },
    {
      category: 'General',
      question: 'Do you work with international remote clients across different time zones?',
      answer: 'Yes, I have extensive experience working remotely with international clients across the USA, Dubai (UAE), and Bangladesh, utilizing asynchronous communication and structured updates via ClickUp, Email, and scheduled video consultations.',
      order: 5,
      active: true,
    },
  ];

  for (const f of faqsData) {
    const existing = await prisma.faq.findFirst({ where: { question: f.question } });
    if (!existing) {
      await prisma.faq.create({ data: f });
    }
  }
  console.log('✅ FAQs seeded.');

  // 7. Verified Client Testimonials
  const testimonialsData = [
    {
      clientName: 'Marketing Director',
      clientRole: 'Head of Growth',
      clientCompany: 'ORA Organic (Dubai)',
      clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: 'Sakhawat transformed our ad creative process. His understanding of sales psychology and clean e-commerce visual framing directly contributed to our highest ROAS month to date.',
      rating: 5,
      projectTitle: 'E-commerce Ads Campaign',
      featured: true,
      active: true,
      order: 1,
    },
    {
      clientName: 'Managing Director',
      clientRole: 'Executive Lead',
      clientCompany: 'e-Learn IT Institute',
      clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: 'A consummate professional who delivers consistent, top-tier graphic design and brand identity work. Sakhawat communicates proactively and always meets tight deadlines.',
      rating: 5,
      projectTitle: 'Brand Identity & Marketing Assets',
      featured: true,
      active: true,
      order: 2,
    },
    {
      clientName: 'Operations Lead',
      clientRole: 'Creative Director',
      clientCompany: 'Advanced Digital Automotive (USA)',
      clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      content: 'The thumbnail designs and short-form video pacing Sakhawat developed gave our content the professional edge it needed. Highly recommended for any brand needing sales-driven creative.',
      rating: 5,
      projectTitle: 'Video & Thumbnail Creatives',
      featured: true,
      active: true,
      order: 3,
    },
  ];

  for (const t of testimonialsData) {
    const existing = await prisma.testimonial.findFirst({ where: { clientCompany: t.clientCompany } });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log('✅ Client Testimonials seeded.');

  console.log('🎉 Seeding successfully finished for Md Sakhawat Hossain!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
