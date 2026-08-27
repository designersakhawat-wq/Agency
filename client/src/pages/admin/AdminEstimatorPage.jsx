import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Plus,
  Trash2,
  Edit2,
  Save,
  Sparkles,
  Zap,
  Gift,
  TrendingUp,
  ShieldCheck,
  Check,
  Layers,
  Clock,
  Coins,
  Sliders,
  Eye,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';

const DEFAULT_ESTIMATOR_CONFIG = {
  badge: 'Interactive Cost & ROI Calculator',
  title: 'Calculate Your Custom Project & ROI in 60s',
  subtitle:
    'Select your requirements below to see an instant transparent price quote and lock in an exclusive 15% discount voucher.',
  discount_percent: 15,
  roi_multiplier_min: 3.2,
  roi_multiplier_max: 5.5,
  turnaround_standard_label: 'Standard (3–5 Days)',
  turnaround_standard_sub: 'Regular schedule',
  turnaround_rush_label: 'Express Rush (24–48 Hours)',
  turnaround_rush_sub: '+35% priority surge',
  turnaround_rush_multiplier: 1.35,
  cta_button_text: 'Lock In This Project Quote',
  guarantee_text: 'Includes free consultation call & revision rights',
  services: [
    {
      id: 'ads',
      name: 'Social Media & Ad Creatives',
      basePrice: 45,
      unitLabel: 'Creatives',
      min: 3,
      max: 20,
      icon: '🎯',
    },
    {
      id: 'branding',
      name: 'Logo & Brand Identity',
      basePrice: 280,
      unitLabel: 'Brand Assets / Variations',
      min: 1,
      max: 5,
      icon: '🎨',
    },
    {
      id: 'packaging',
      name: 'Product Packaging & 3D Mockup',
      basePrice: 120,
      unitLabel: 'Packaging SKUs',
      min: 1,
      max: 8,
      icon: '📦',
    },
    {
      id: 'banner',
      name: 'High-Impact Banner & Hero Web Ads',
      basePrice: 60,
      unitLabel: 'Banner Sizes',
      min: 2,
      max: 12,
      icon: '🚀',
    },
  ],
  addons: [
    { id: 'source_files', name: 'Editable Source Files (PSD/AI/Figma)', price: 40 },
    { id: 'fast_revisions', name: 'Unlimited Priority Revisions (7-Day)', price: 60 },
    { id: 'animated_motion', name: 'Animated Video / Motion Version (MP4)', price: 95 },
  ],
};

export const AdminEstimatorPage = () => {
  const { showToast } = useToast();
  const { currencySymbol, formatAmount } = useCurrency();
  const [config, setConfig] = useState(DEFAULT_ESTIMATOR_CONFIG);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('services'); // services | addons | settings | preview
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteServiceTarget, setDeleteServiceTarget] = useState(null);
  const [deleteAddonTarget, setDeleteAddonTarget] = useState(null);


  // Simulator States for Live Testing
  const [simServiceId, setSimServiceId] = useState('ads');
  const [simQuantity, setSimQuantity] = useState(5);
  const [simTurnaround, setSimTurnaround] = useState('standard');
  const [simAddons, setSimAddons] = useState(['source_files']);
  const [simDiscount, setSimDiscount] = useState(false);

  useEffect(() => {
    const fetchEstimatorSettings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/settings');
        if (res.success && res.data?.estimator_config) {
          let parsed = res.data.estimator_config;
          if (typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch (e) {
              parsed = DEFAULT_ESTIMATOR_CONFIG;
            }
          }
          setConfig({
            ...DEFAULT_ESTIMATOR_CONFIG,
            ...parsed,
            services: Array.isArray(parsed.services) ? parsed.services : DEFAULT_ESTIMATOR_CONFIG.services,
            addons: Array.isArray(parsed.addons) ? parsed.addons : DEFAULT_ESTIMATOR_CONFIG.addons,
          });
        }
      } catch (err) {
        console.error('Failed to load estimator settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimatorSettings();
  }, []);

  const handleSaveAll = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setConfirmSaveOpen(true);
  };

  const executeSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        estimator_config: config,
      };

      const res = await api.post('/settings/admin/bulk', { settings: payload });
      if (res.success) {
        showToast('Estimator configuration saved successfully!', 'success');
        setConfirmSaveOpen(false);
      } else {
        showToast(res.message || 'Failed to save configuration', 'error');
      }
    } catch (err) {
      showToast('Error saving estimator configuration: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add Service
  const handleAddService = () => {
    const newService = {
      id: `srv_${Date.now()}`,
      name: 'New Custom Service',
      basePrice: 50,
      unitLabel: 'Units / Items',
      min: 1,
      max: 10,
      icon: '✨',
    };
    setConfig((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
  };

  // Delete Service
  const executeDeleteService = () => {
    if (!deleteServiceTarget) return;
    setConfig((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== deleteServiceTarget.id),
    }));
    showToast(`Service "${deleteServiceTarget.name}" removed`, 'info');
    setDeleteServiceTarget(null);
  };

  // Add Addon
  const handleAddAddon = () => {
    const newAddon = {
      id: `addon_${Date.now()}`,
      name: 'New Enhancement Add-on',
      price: 35,
    };
    setConfig((prev) => ({
      ...prev,
      addons: [...prev.addons, newAddon],
    }));
  };

  // Delete Addon
  const executeDeleteAddon = () => {
    if (!deleteAddonTarget) return;
    setConfig((prev) => ({
      ...prev,
      addons: prev.addons.filter((a) => a.id !== deleteAddonTarget.id),
    }));
    showToast(`Add-on "${deleteAddonTarget.name}" removed`, 'info');
    setDeleteAddonTarget(null);
  };

  // Calculate live preview math
  const curSimService =
    config.services.find((s) => s.id === simServiceId) || config.services[0] || {
      basePrice: 50,
      unitLabel: 'Units',
      min: 1,
      max: 10,
      name: 'Service',
    };

  const simTurnMultiplier =
    simTurnaround === 'rush' ? Number(config.turnaround_rush_multiplier) || 1.35 : 1.0;
  const simBase = (Number(curSimService.basePrice) || 0) * simQuantity;
  const simAddonSum = simAddons.reduce((acc, aId) => {
    const found = config.addons.find((a) => a.id === aId);
    return acc + (found ? Number(found.price) || 0 : 0);
  }, 0);
  const simSubtotal = Math.round((simBase + simAddonSum) * simTurnMultiplier);
  const simDiscountAmt = simDiscount ? Math.round(simSubtotal * ((Number(config.discount_percent) || 15) / 100)) : 0;
  const simFinalTotal = simSubtotal - simDiscountAmt;
  const simRoiMin = Math.round(simFinalTotal * (Number(config.roi_multiplier_min) || 3.2));
  const simRoiMax = Math.round(simFinalTotal * (Number(config.roi_multiplier_max) || 5.5));

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Calculator className="w-4 h-4 text-teal-400" />
            <span>Interactive ROI & Price Engine CMS</span>
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-tight">
            Project Estimator Configuration
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Fully customize services, base prices, quantity sliders, add-on enhancements, and ROI calculations displayed on the homepage calculator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Save}
            isLoading={saving}
            onClick={handleSaveAll}
            className="cursor-pointer font-bold shadow-xl shadow-teal-950/50"
          >
            Save All Estimator Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-card border border-zinc-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'services'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Design Services & Rates ({config.services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'addons'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>2. Add-ons & Speed ({config.addons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>3. Section Copy, Discount & ROI</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>4. Live Simulator & Preview</span>
        </button>
      </div>

      {/* TAB 1: DESIGN SERVICES */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Design Services & Base Rates</h3>
              <p className="text-xs text-zinc-400">
                Configure the service cards selectable in Step 1 of the estimator.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleAddService}
              className="cursor-pointer"
            >
              Add New Service Card
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {config.services.map((srv, idx) => (
              <div
                key={srv.id || idx}
                className="p-6 rounded-2xl glass-card border border-zinc-800 hover:border-teal-500/40 transition-all space-y-4 relative group"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      value={srv.icon || '🎯'}
                      onChange={(e) => {
                        const updated = [...config.services];
                        updated[idx].icon = e.target.value;
                        setConfig({ ...config, services: updated });
                      }}
                      className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 text-center text-lg focus:outline-none focus:border-teal-400"
                      title="Emoji Icon"
                    />
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                      Card #{idx + 1}
                    </span>
                  </div>

                  <button
                    onClick={() => setDeleteServiceTarget(srv)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Service Title *
                    </label>
                    <input
                      type="text"
                      value={srv.name}
                      onChange={(e) => {
                        const updated = [...config.services];
                        updated[idx].name = e.target.value;
                        setConfig({ ...config, services: updated });
                      }}
                      placeholder="e.g. Social Media & Ad Creatives"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-400 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Base Price ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        value={srv.basePrice}
                        onChange={(e) => {
                          const updated = [...config.services];
                          updated[idx].basePrice = Number(e.target.value) || 0;
                          setConfig({ ...config, services: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Min Qty
                      </label>
                      <input
                        type="number"
                        value={srv.min || 1}
                        onChange={(e) => {
                          const updated = [...config.services];
                          updated[idx].min = Number(e.target.value) || 1;
                          setConfig({ ...config, services: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                        Max Qty
                      </label>
                      <input
                        type="number"
                        value={srv.max || 10}
                        onChange={(e) => {
                          const updated = [...config.services];
                          updated[idx].max = Number(e.target.value) || 10;
                          setConfig({ ...config, services: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Slider Unit Label (e.g. "Creatives", "Packaging SKUs", "Brand Assets")
                    </label>
                    <input
                      type="text"
                      value={srv.unitLabel || 'Units'}
                      onChange={(e) => {
                        const updated = [...config.services];
                        updated[idx].unitLabel = e.target.value;
                        setConfig({ ...config, services: updated });
                      }}
                      placeholder="e.g. Creatives"
                      className="w-full px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ADD-ONS & SPEED */}
      {activeTab === 'addons' && (
        <div className="space-y-8">
          {/* Add-ons List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Recommended Enhancement Add-ons</h3>
                <p className="text-xs text-zinc-400">
                  Optional checkboxes clients can toggle to add extra deliverables.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={handleAddAddon}
                className="cursor-pointer"
              >
                Add Enhancement Add-on
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.addons.map((addon, idx) => (
                <div
                  key={addon.id || idx}
                  className="p-5 rounded-2xl glass-card border border-zinc-800 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-teal-400 uppercase">
                      Add-on #{idx + 1}
                    </span>
                    <button
                      onClick={() => setDeleteAddonTarget(addon)}
                      className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Addon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                      Deliverable Name
                    </label>
                    <input
                      type="text"
                      value={addon.name}
                      onChange={(e) => {
                        const updated = [...config.addons];
                        updated[idx].name = e.target.value;
                        setConfig({ ...config, addons: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                      Price Rate ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={addon.price}
                      onChange={(e) => {
                        const updated = [...config.addons];
                        updated[idx].price = Number(e.target.value) || 0;
                        setConfig({ ...config, addons: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Turnaround Options */}
          <div className="p-6 rounded-2xl glass-card border border-zinc-800 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Turnaround Speed & Rush Surge Rates</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-white block">Standard Delivery</span>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Title Label</label>
                  <input
                    type="text"
                    value={config.turnaround_standard_label}
                    onChange={(e) =>
                      setConfig({ ...config, turnaround_standard_label: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Subtext</label>
                  <input
                    type="text"
                    value={config.turnaround_standard_sub}
                    onChange={(e) =>
                      setConfig({ ...config, turnaround_standard_sub: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-400 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Express Rush */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <span className="text-xs font-bold text-amber-300 block">Express Rush Delivery</span>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Title Label</label>
                  <input
                    type="text"
                    value={config.turnaround_rush_label}
                    onChange={(e) =>
                      setConfig({ ...config, turnaround_rush_label: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Subtext</label>
                    <input
                      type="text"
                      value={config.turnaround_rush_sub}
                      onChange={(e) =>
                        setConfig({ ...config, turnaround_rush_sub: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-400 focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-amber-300 font-semibold block mb-1">
                      Multiplier (e.g. 1.35 = +35%)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={config.turnaround_rush_multiplier}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          turnaround_rush_multiplier: Number(e.target.value) || 1.35,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-amber-300 font-mono focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECTION COPY & ROI */}
      {activeTab === 'settings' && (
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider">
            Section Headlines, Discount & ROI Multipliers
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Top Badge Text
              </label>
              <input
                type="text"
                value={config.badge}
                onChange={(e) => setConfig({ ...config, badge: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Main Section Title
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-400 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Subtitle Description
              </label>
              <textarea
                rows={2}
                value={config.subtitle}
                onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-zinc-800">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  First-Order Voucher Discount (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={config.discount_percent}
                    onChange={(e) =>
                      setConfig({ ...config, discount_percent: Number(e.target.value) || 15 })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-amber-300 font-mono focus:outline-none focus:border-teal-400"
                  />
                  <span className="text-xs text-zinc-400 font-mono">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Projected ROI Min Multiplier (x)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.roi_multiplier_min}
                  onChange={(e) =>
                    setConfig({ ...config, roi_multiplier_min: Number(e.target.value) || 3.2 })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Projected ROI Max Multiplier (x)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.roi_multiplier_max}
                  onChange={(e) =>
                    setConfig({ ...config, roi_multiplier_max: Number(e.target.value) || 5.5 })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-zinc-800">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Quote CTA Button Text
                </label>
                <input
                  type="text"
                  value={config.cta_button_text}
                  onChange={(e) => setConfig({ ...config, cta_button_text: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-teal-400 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Guarantee Subtext
                </label>
                <input
                  type="text"
                  value={config.guarantee_text}
                  onChange={(e) => setConfig({ ...config, guarantee_text: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE SIMULATOR / PREVIEW */}
      {activeTab === 'preview' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-teal-500/40 bg-zinc-950/80 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h3 className="text-base font-bold text-white">Live Estimator Real-Time Simulator</h3>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Interactive Mode
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Services */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-teal-400 font-mono">1. Choose Service:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {config.services.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setSimServiceId(srv.id);
                        setSimQuantity(srv.min || 1);
                      }}
                      className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                        simServiceId === srv.id
                          ? 'bg-teal-500/15 border-teal-400 text-white shadow-lg'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xl mb-1">{srv.icon || '🎯'}</div>
                      <div className="text-xs font-bold text-white">{srv.name}</div>
                      <div className="text-[11px] text-teal-400 font-mono mt-0.5">
                        Starts at {formatAmount(srv.basePrice)}/{srv.unitLabel || 'unit'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Quantity Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400 font-mono">
                    2. Select Volume ({curSimService.unitLabel || 'Units'}):
                  </span>
                  <span className="text-sm font-black text-white font-mono px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800">
                    {simQuantity}
                  </span>
                </div>
                <input
                  type="range"
                  min={curSimService.min || 1}
                  max={curSimService.max || 10}
                  value={simQuantity}
                  onChange={(e) => setSimQuantity(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
              </div>

              {/* Step 3: Turnaround & Addons */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-teal-400 font-mono">
                  3. Turnaround Speed & Add-ons:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSimTurnaround('standard')}
                    className={`p-3 rounded-xl text-left border text-xs cursor-pointer ${
                      simTurnaround === 'standard'
                        ? 'bg-teal-500/20 border-teal-400 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold">{config.turnaround_standard_label}</div>
                    <div className="text-[10px] text-zinc-500">{config.turnaround_standard_sub}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimTurnaround('rush')}
                    className={`p-3 rounded-xl text-left border text-xs cursor-pointer ${
                      simTurnaround === 'rush'
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-amber-300">{config.turnaround_rush_label}</div>
                    <div className="text-[10px] text-zinc-500">{config.turnaround_rush_sub}</div>
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {config.addons.map((a) => {
                    const checked = simAddons.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() =>
                          setSimAddons(
                            checked ? simAddons.filter((id) => id !== a.id) : [...simAddons, a.id]
                          )
                        }
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer ${
                          checked
                            ? 'bg-teal-500/10 border-teal-400 text-white'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span>{a.name}</span>
                        <span className="font-mono font-bold text-teal-400">+{formatAmount(a.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Card Output */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-3xl glass-panel border-2 border-teal-500/60 shadow-2xl space-y-5 bg-[#0e131b]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-teal-400 uppercase font-bold">
                    Live Calculated Quote
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Guaranteed Rate
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-display text-white">
                      {formatAmount(simFinalTotal)}
                    </span>
                    {simDiscount && (
                      <span className="text-lg text-zinc-500 line-through font-bold">
                        {formatAmount(simSubtotal)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Transparent fixed cost • No hidden fees
                  </p>
                </div>

                {/* ROI */}
                <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    <span>Projected Campaign ROI & Impact:</span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono">
                    Estimated brand value lift: <strong>{formatAmount(simRoiMin)} – {formatAmount(simRoiMax)}+</strong>
                  </p>
                </div>

                {/* Discount Voucher */}
                <button
                  type="button"
                  onClick={() => setSimDiscount(!simDiscount)}
                  className="w-full p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    {simDiscount ? '15% Voucher Applied!' : 'Apply 15% First-Order Voucher'}
                  </span>
                  <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded font-bold">
                    {simDiscount ? 'Active' : 'Claim'}
                  </span>
                </button>

                <Button variant="primary" size="lg" className="w-full font-bold">
                  {config.cta_button_text}
                </Button>

                <p className="text-[11px] text-zinc-500 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>{config.guarantee_text}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={executeSaveAll}
        title="Save Estimator Configuration?"
        message="Are you sure you want to save and deploy all custom services, base rates, add-ons, and ROI calculation formulas live to the website?"
        confirmText="Yes, Save Estimator"
        cancelText="Review Again"
        isLoading={saving}
        variant="primary"
      />

      {/* Confirm Delete Service Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteServiceTarget)}
        onClose={() => setDeleteServiceTarget(null)}
        onConfirm={executeDeleteService}
        title="Delete Design Service Card?"
        message={`Are you sure you want to remove "${deleteServiceTarget?.name}" from the project estimator?`}
        confirmText="Yes, Delete Service"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Confirm Delete Addon Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteAddonTarget)}
        onClose={() => setDeleteAddonTarget(null)}
        onConfirm={executeDeleteAddon}
        title="Delete Enhancement Add-on?"
        message={`Are you sure you want to remove "${deleteAddonTarget?.name}"?`}
        confirmText="Yes, Delete Addon"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default AdminEstimatorPage;
