import React, { useState, useEffect } from 'react';
import HeroSection from '../../components/home/HeroSection';
import StatsSection from '../../components/home/StatsSection';
import FeaturedProjects from '../../components/home/FeaturedProjects';
import ServicesGrid from '../../components/home/ServicesGrid';
import PricingTiers from '../../components/home/PricingTiers';
import ProcessSection from '../../components/home/ProcessSection';
import TestimonialsSlider from '../../components/home/TestimonialsSlider';
import BrandsMarquee from '../../components/home/BrandsMarquee';
import FaqAccordion from '../../components/home/FaqAccordion';
import ContactSection from '../../components/home/ContactSection';
import BookingModal from '../../components/home/BookingModal';
import InteractiveProjectEstimator from '../../components/home/InteractiveProjectEstimator';
import BeforeAfterSlider from '../../components/home/BeforeAfterSlider';
import CreativeGatewayHub from '../../components/home/CreativeGatewayHub';
import InterconnectedExploreHub from '../../components/home/InterconnectedExploreHub';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { api } from '../../services/api';
import { ExternalLink, Figma, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_SETTINGS,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_PACKAGES,
  DEFAULT_TESTIMONIALS,
  DEFAULT_FAQS,
  DEFAULT_BRANDS,
} from '../../data/defaultData';
import { safeSetItem, safeGetItem } from '../../utils/safeStorage';

const getLocalJson = (key, fallback) => {
  return safeGetItem(key, fallback);
};

const HomePage = () => {
  const [settings, setSettings] = useState(() => getLocalJson('sakhawat_cached_settings', DEFAULT_SETTINGS));
  const [projects, setProjects] = useState(() => getLocalJson('sakhawat_cached_featured_projects', DEFAULT_PROJECTS));
  const [services, setServices] = useState(() => getLocalJson('sakhawat_cached_services', DEFAULT_SERVICES));
  const [packages, setPackages] = useState(() => getLocalJson('sakhawat_cached_packages', DEFAULT_PACKAGES));
  const [testimonials, setTestimonials] = useState(() => getLocalJson('sakhawat_cached_testimonials', DEFAULT_TESTIMONIALS));
  const [faqs, setFaqs] = useState(() => getLocalJson('sakhawat_cached_faqs', DEFAULT_FAQS));
  const [brands, setBrands] = useState(() => getLocalJson('sakhawat_cached_brands', DEFAULT_BRANDS));
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState('');
  const [previewProject, setPreviewProject] = useState(null);
  useEffect(() => {
    // Fetch consolidated homepage data in 1 single HTTP request
    const fetchData = async () => {
      try {
        const res = await api.get('/homepage').catch(() => null);
        if (res && res.success && res.data) {
          const d = res.data;
          if (d.settings && Object.keys(d.settings).length > 0) {
            setSettings(d.settings);
            safeSetItem('sakhawat_cached_settings', d.settings);
          }
          if (Array.isArray(d.projects) && d.projects.length > 0) {
            setProjects(d.projects);
            safeSetItem('sakhawat_cached_featured_projects', d.projects);
          }
          if (Array.isArray(d.services) && d.services.length > 0) {
            setServices(d.services);
            safeSetItem('sakhawat_cached_services', d.services);
          }
          if (Array.isArray(d.packages) && d.packages.length > 0) {
            setPackages(d.packages);
            safeSetItem('sakhawat_cached_packages', d.packages);
          }
          if (Array.isArray(d.testimonials) && d.testimonials.length > 0) {
            setTestimonials(d.testimonials);
            safeSetItem('sakhawat_cached_testimonials', d.testimonials);
          }
          if (Array.isArray(d.faqs) && d.faqs.length > 0) {
            setFaqs(d.faqs);
            safeSetItem('sakhawat_cached_faqs', d.faqs);
          }
          if (Array.isArray(d.brands) && d.brands.length > 0) {
            setBrands(d.brands);
            safeSetItem('sakhawat_cached_brands', d.brands);
          }
          return;
        }

        // Fallback to parallel requests if /homepage is not available
        const [settingsRes, projectsRes, servicesRes, packagesRes, testimonialsRes, faqsRes, brandsRes] =
          await Promise.all([
            api.get('/settings').catch(() => ({ success: false })),
            api.get('/projects?featured=true').catch(() => ({ success: false })),
            api.get('/services').catch(() => ({ success: false })),
            api.get('/packages').catch(() => ({ success: false })),
            api.get('/testimonials').catch(() => ({ success: false })),
            api.get('/faqs').catch(() => ({ success: false })),
            api.get('/brands').catch(() => ({ success: false })),
          ]);

        if (settingsRes.success && settingsRes.data) {
          setSettings(settingsRes.data);
          safeSetItem('sakhawat_cached_settings', settingsRes.data);
        }
        if (projectsRes.success && Array.isArray(projectsRes.data)) {
          setProjects(projectsRes.data);
        }
        if (servicesRes.success && Array.isArray(servicesRes.data)) {
          setServices(servicesRes.data);
        }
        if (packagesRes.success && Array.isArray(packagesRes.data)) {
          setPackages(packagesRes.data);
        }
        if (testimonialsRes.success && Array.isArray(testimonialsRes.data)) {
          setTestimonials(testimonialsRes.data);
        }
        if (faqsRes.success && Array.isArray(faqsRes.data)) {
          setFaqs(faqsRes.data);
        }
        if (brandsRes.success && Array.isArray(brandsRes.data)) {
          setBrands(brandsRes.data);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      }
    };

    fetchData();
  }, []);

  const handleOpenBooking = (serviceName = '') => {
    setSelectedServiceForBooking(typeof serviceName === 'string' ? serviceName : '');
    setIsBookingOpen(true);
  };

  return (
    <div className="relative">
      {/* Hero */}
      <HeroSection settings={settings} onOpenBooking={() => handleOpenBooking()} />

      {/* Brands Marquee */}
      <BrandsMarquee brands={brands} />

      {/* Stats */}
      <StatsSection settings={settings} />

      {/* Multi-Page Creative Gateway Hub (Connecting to Services & Portfolio) */}
      <CreativeGatewayHub />

      {/* Featured Projects */}
      <FeaturedProjects
        projects={projects}
        onSelectProject={(proj) => setPreviewProject(proj)}
      />

      {/* Interactive Project Cost & ROI Estimator */}
      <InteractiveProjectEstimator onOpenBooking={handleOpenBooking} />

      {/* Interactive Before & After Transformation Slider */}
      <BeforeAfterSlider onOpenBooking={handleOpenBooking} />

      {/* Process Workflow */}
      <ProcessSection />

      {/* Pricing Packages */}
      <PricingTiers
        packages={packages}
        onSelectPackage={(pkg) => handleOpenBooking(pkg.name)}
      />

      {/* Testimonials */}
      <TestimonialsSlider testimonials={testimonials} />

      {/* FAQs */}
      <FaqAccordion faqs={faqs} />

      {/* Interconnected Discovery Roadmap Hub */}
      <InterconnectedExploreHub />

      {/* Contact & Inquiries */}
      <ContactSection />

      {/* Interactive Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        defaultService={selectedServiceForBooking}
      />

      {/* Quick Project Preview Modal */}
      {previewProject && (
        <Modal
          isOpen={Boolean(previewProject)}
          onClose={() => setPreviewProject(null)}
          title={previewProject.title}
          subtitle={`${previewProject.category} • ${previewProject.year || '2025'}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="rounded-xl overflow-hidden aspect-[16/9] bg-zinc-900">
              <img
                src={previewProject.coverImage}
                alt={previewProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-1">
                Project Overview
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">{previewProject.summary}</p>
            </div>

            {previewProject.challenges && (
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-2">
                <span className="font-bold text-white block">Key Challenge & Solution:</span>
                <p>{previewProject.solutions || previewProject.challenges}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-3">
                {previewProject.figmaUrl && (
                  <a
                    href={previewProject.figmaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <Figma className="w-4 h-4" />
                    <span>Figma File</span>
                  </a>
                )}
                {previewProject.liveUrl && (
                  <a
                    href={previewProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Preview</span>
                  </a>
                )}
              </div>

              <Link
                to={`/portfolio/${previewProject.slug}`}
                onClick={() => setPreviewProject(null)}
              >
                <Button variant="primary" size="sm" icon={ArrowUpRight} iconPosition="right">
                  Read Full Case Study
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HomePage;
