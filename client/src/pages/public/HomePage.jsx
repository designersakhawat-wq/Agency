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
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { api } from '../../services/api';
import { ExternalLink, Figma, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const getLocalJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const HomePage = () => {
  const [settings, setSettings] = useState(() => getLocalJson('sakhawat_cached_settings', {}));
  const [projects, setProjects] = useState(() => getLocalJson('sakhawat_cached_featured_projects', []));
  const [services, setServices] = useState(() => getLocalJson('sakhawat_cached_services', []));
  const [packages, setPackages] = useState(() => getLocalJson('sakhawat_cached_packages', []));
  const [testimonials, setTestimonials] = useState(() => getLocalJson('sakhawat_cached_testimonials', []));
  const [faqs, setFaqs] = useState(() => getLocalJson('sakhawat_cached_faqs', []));
  const [brands, setBrands] = useState(() => getLocalJson('sakhawat_cached_brands', []));
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState('');
  const [previewProject, setPreviewProject] = useState(null);

  useEffect(() => {
    // Fetch all public page data in parallel
    const fetchData = async () => {
      try {
        const [
          settingsRes,
          projectsRes,
          servicesRes,
          packagesRes,
          testimonialsRes,
          faqsRes,
          brandsRes,
        ] = await Promise.all([
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
          localStorage.setItem('sakhawat_cached_settings', JSON.stringify(settingsRes.data));
        }
        if (projectsRes.success && projectsRes.data) {
          setProjects(projectsRes.data);
          localStorage.setItem('sakhawat_cached_featured_projects', JSON.stringify(projectsRes.data));
        }
        if (servicesRes.success && servicesRes.data) {
          setServices(servicesRes.data);
          localStorage.setItem('sakhawat_cached_services', JSON.stringify(servicesRes.data));
        }
        if (packagesRes.success && packagesRes.data) {
          setPackages(packagesRes.data);
          localStorage.setItem('sakhawat_cached_packages', JSON.stringify(packagesRes.data));
        }
        if (testimonialsRes.success && testimonialsRes.data) {
          setTestimonials(testimonialsRes.data);
          localStorage.setItem('sakhawat_cached_testimonials', JSON.stringify(testimonialsRes.data));
        }
        if (faqsRes.success && faqsRes.data) {
          setFaqs(faqsRes.data);
          localStorage.setItem('sakhawat_cached_faqs', JSON.stringify(faqsRes.data));
        }
        if (brandsRes.success && brandsRes.data) {
          setBrands(brandsRes.data);
          localStorage.setItem('sakhawat_cached_brands', JSON.stringify(brandsRes.data));
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

      {/* Featured Projects */}
      <FeaturedProjects
        projects={projects}
        onSelectProject={(proj) => setPreviewProject(proj)}
      />

      {/* Interactive Project Cost & ROI Estimator */}
      <InteractiveProjectEstimator onOpenBooking={handleOpenBooking} />

      {/* Services Grid */}
      <ServicesGrid
        services={services}
        onOpenBooking={(s) => handleOpenBooking(s?.title)}
      />

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
