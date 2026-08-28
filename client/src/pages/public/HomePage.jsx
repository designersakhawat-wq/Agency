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
import DataVault from '../../utils/dataVault';

const getLocalJson = (key, fallback) => {
  return safeGetItem(key, fallback);
};

const HomePage = () => {
  const [settings, setSettings] = useState(() => DataVault.mergeSettings(getLocalJson('sakhawat_cached_settings', DEFAULT_SETTINGS)));
  const [projects, setProjects] = useState(() => DataVault.mergeProjects(getLocalJson('sakhawat_cached_featured_projects', DEFAULT_PROJECTS)));
  const [services, setServices] = useState(() => getLocalJson('sakhawat_cached_services', DEFAULT_SERVICES));
  const [packages, setPackages] = useState(() => getLocalJson('sakhawat_cached_packages', DEFAULT_PACKAGES));
  const [testimonials, setTestimonials] = useState(() => getLocalJson('sakhawat_cached_testimonials', DEFAULT_TESTIMONIALS));
  const [faqs, setFaqs] = useState(() => getLocalJson('sakhawat_cached_faqs', DEFAULT_FAQS));
  const [brands, setBrands] = useState(() => getLocalJson('sakhawat_cached_brands', DEFAULT_BRANDS));
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState('');
  useEffect(() => {
    // Fetch consolidated homepage data in 1 single HTTP request
    const fetchData = async () => {
      try {
        const res = await api.get('/homepage').catch(() => null);
        if (res && res.success && res.data) {
          const d = res.data;
          if (d.settings && Object.keys(d.settings).length > 0) {
            const mergedSettings = DataVault.mergeSettings(d.settings);
            setSettings(mergedSettings);
          }
          if (Array.isArray(d.projects) && d.projects.length > 0) {
            const mergedProjects = DataVault.mergeProjects(d.projects);
            setProjects(mergedProjects);
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
          const mergedSettings = DataVault.mergeSettings(settingsRes.data);
          setSettings(mergedSettings);
        }
        if (projectsRes.success && Array.isArray(projectsRes.data)) {
          const mergedProjects = DataVault.mergeProjects(projectsRes.data);
          setProjects(mergedProjects);
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
      <FeaturedProjects projects={projects} />

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
    </div>
  );
};

export default HomePage;
