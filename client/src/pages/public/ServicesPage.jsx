import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
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

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [srvRes, faqRes] = await Promise.all([
          api.get('/services'),
          api.get('/faqs'),
        ]);
        if (srvRes.success) setServices(srvRes.data || []);
        if (faqRes.success) setFaqs(faqRes.data || []);
      } catch (err) {
        console.error('Error loading services overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loader message="Loading creative service offerings..." fullScreen />;
  }

  return (
    <div className="pt-32 pb-24 min-h-screen relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow-teal top-24 left-1/3 opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-24">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Core Creative Capabilities
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black text-white tracking-tight">
            Strategic Creative Services That Convert
          </h1>
          <p className="text-base sm:text-lg text-zinc-300">
            From distinct brand identities to sales-driven social ads and viral UGC video editing, every service is engineered with marketing psychology and aesthetic precision.
          </p>
        </div>

        {/* Services Grid (4 Core Services Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((s) => {
            const Icon = iconMap[s.icon] || Palette;
            const packages = s.packages || [];
            const features = Array.isArray(s.features) ? s.features : [];

            // Calculate starting price
            let minPrice = null;
            if (packages.length > 0) {
              const prices = packages.map((p) => Number(p.price)).filter((p) => !isNaN(p));
              if (prices.length > 0) minPrice = Math.min(...prices);
            }

            return (
              <div
                key={s.id}
                className="p-8 rounded-3xl glass-card border border-zinc-800 hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    {minPrice !== null && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-teal-400">
                        Starting from ${minPrice}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold font-display text-white group-hover:text-teal-300 transition-colors">
                    {s.title}
                  </h3>

                  {s.tagline && (
                    <p className="text-xs font-medium text-teal-400 uppercase tracking-wider">
                      {s.tagline}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {s.description}
                  </p>

                  {/* Highlights checklist */}
                  {features.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {features.slice(0, 3).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 text-xs text-zinc-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <Link to={`/services/${s.slug}`}>
                    <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                      View Service Details
                    </Button>
                  </Link>
                  <Link to="/book-a-meeting" className="text-xs text-zinc-400 hover:text-white">
                    Book Discovery Call →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <FaqAccordion faqs={faqs} />

        {/* Bottom CTA */}
        <div className="p-8 sm:p-12 rounded-3xl glass-card border border-teal-500/30 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-display font-black text-white">
            Need a Custom Design Retainer or Bulk Campaign?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            I collaborate with international agencies and scaling brands on ongoing monthly retainers with dedicated turnaround guarantees.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/book-a-meeting">
              <Button variant="primary" size="lg" icon={Calendar}>
                Book a Meeting
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Contact Directly
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
