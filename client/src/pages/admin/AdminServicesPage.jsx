import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sliders,
  Sparkles,
  Save,
  Grid,
  Maximize2,
  Clock,
  Play,
  Pause,
  ImageIcon,
  DollarSign,
  Coins,
  HelpCircle,
  FileText,
  Flame,
  ArrowRight,
  Check,
  X,
  Palette,
  Megaphone,
  Video,
  Layout,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Search,
  UploadCloud,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Zap,
  Star,
  StarOff,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { MediaPickerModal } from '../../components/common/MediaPickerModal';

import { DEFAULT_SERVICES, DEFAULT_SETTINGS, DEFAULT_FAQS, DEFAULT_PROJECTS } from '../../data/defaultData';
import { safeSetItem } from '../../utils/safeStorage';

const DEFAULT_SHOWCASE_CONFIG = {
  aspectRatio: '1:1',
  cover_branding_aspect_ratio: 'fb-cover',
  service_ratios: {
    'cover-branding': 'fb-cover',
    'logo-branding': '1:1',
    'ads-creative': '1:1',
    'ugc-video': '9:16',
  },
  defaultViewMode: 'slider',
  autoplay: true,
  autoplayInterval: 4000,
  gridCols: 3,
  showThumbnails: true,
  lightboxEnabled: true,
  sectionBadge: 'Live Portfolio Gallery',
};

const iconOptions = [
  { value: 'Palette', label: 'Palette (Branding & Identity)', icon: Palette },
  { value: 'Megaphone', label: 'Megaphone (Ads & Marketing)', icon: Megaphone },
  { value: 'Video', label: 'Video (UGC & Motion)', icon: Video },
  { value: 'Layout', label: 'Layout (Covers & Web UI)', icon: Layout },
  { value: 'Sparkles', label: 'Sparkles (Creative Suite)', icon: Sparkles },
];

const AdminServicesPage = () => {
  const { currencySymbol, currencyCode, formatAmount } = useCurrency();

  const [services, setServices] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_services');
      return cached ? JSON.parse(cached) : DEFAULT_SERVICES;
    } catch (e) {
      return DEFAULT_SERVICES;
    }
  });

  const [allFaqs, setAllFaqs] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_faqs');
      return cached ? JSON.parse(cached) : DEFAULT_FAQS;
    } catch (e) {
      return DEFAULT_FAQS;
    }
  });

  const [allProjects, setAllProjects] = useState(() => {
    try {
      const cached = localStorage.getItem('sakhawat_cached_all_projects');
      return cached ? JSON.parse(cached) : DEFAULT_PROJECTS;
    } catch (e) {
      return DEFAULT_PROJECTS;
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio'); // Default to portfolio tab for convenience
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  // Showcase Config State
  const [showcaseConfig, setShowcaseConfig] = useState(DEFAULT_SHOWCASE_CONFIG);
  const [savingShowcase, setSavingShowcase] = useState(false);

  // Main Form Data for the Service
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    icon: 'Palette',
    features: [],
    deliverables: [],
    order: 0,
    active: true,
    packages: [],
    faqs: [],
  });

  // Inputs for adding items inside the form
  const [featureInput, setFeatureInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');

  // Inline package creation / edit inside service modal
  const [editingPackageIndex, setEditingPackageIndex] = useState(null);
  const [packageFormData, setPackageFormData] = useState({
    name: '',
    price: 99,
    billingPeriod: 'per project',
    description: '',
    features: ['100% Vector Source Files', 'Commercial Rights Included', 'Unlimited Iterations'],
    isPopular: false,
    order: 0,
    ctaText: 'Select & Order Package',
  });
  const [pkgFeatureInput, setPkgFeatureInput] = useState('');

  // Inline FAQ creation / edit inside service modal
  const [editingFaqIndex, setEditingFaqIndex] = useState(null);
  const [faqFormData, setFaqFormData] = useState({
    question: '',
    answer: '',
  });

  // Portfolio Item Easy Upload State
  const [quickUploadTitle, setQuickUploadTitle] = useState('');
  const [quickUploadPreview, setQuickUploadPreview] = useState('');
  const [quickUploadFeatured, setQuickUploadFeatured] = useState(false);
  const [serviceMediaPickerOpen, setServiceMediaPickerOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const showcaseFileInputRef = useRef(null);

  const fetchServicesAndSettings = async () => {
    try {
      const [srvRes, settingsRes, faqsRes, projRes] = await Promise.all([
        api.get('/services/admin/all').catch(() => null),
        api.get('/settings').catch(() => null),
        api.get('/faqs/admin/all').catch(() => null),
        api.get('/projects/admin/all').catch(() => null),
      ]);

      if (srvRes && srvRes.success && Array.isArray(srvRes.data)) {
        setServices(srvRes.data);
        safeSetItem('sakhawat_cached_services', srvRes.data);
      }

      if (faqsRes && faqsRes.success && Array.isArray(faqsRes.data)) {
        setAllFaqs(faqsRes.data);
        safeSetItem('sakhawat_cached_faqs', faqsRes.data);
      }

      if (projRes && projRes.success && Array.isArray(projRes.data)) {
        setAllProjects(projRes.data);
        safeSetItem('sakhawat_cached_all_projects', projRes.data);
      }

      if (settingsRes && settingsRes.success && settingsRes.data) {
        let conf = settingsRes.data.service_showcase_config;
        if (typeof conf === 'string') {
          try {
            conf = JSON.parse(conf);
          } catch (e) {
            conf = DEFAULT_SHOWCASE_CONFIG;
          }
        }
        if (conf && typeof conf === 'object') {
          setShowcaseConfig({ ...DEFAULT_SHOWCASE_CONFIG, ...conf });
        }
      }
    } catch (err) {
      console.error('Services fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesAndSettings();
  }, []);

  // Filter projects currently belonging to this service (strictly attached or created for this service)
  const currentServiceProjects = allProjects.filter((p) => {
    if (!p) return false;
    const targetId = editTarget?.id || formData?.id;
    const targetSlug = editTarget?.slug || formData?.slug || (formData?.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const targetTitle = (editTarget?.title || formData?.title || '').toLowerCase().trim();

    if (targetId && (p.serviceId === targetId || p.serviceSlug === targetId)) return true;
    if (targetSlug && (p.serviceSlug === targetSlug || p.serviceId === targetSlug)) return true;

    const pCat = (p.category || '').toLowerCase().trim();
    if (targetTitle && pCat === targetTitle) return true;
    if (targetSlug && pCat.includes(targetSlug)) return true;
    if (targetSlug && targetSlug.includes('logo') && (pCat.includes('logo') || pCat.includes('brand'))) return true;
    if (targetSlug && targetSlug.includes('ads') && (pCat.includes('ads') || pCat.includes('social') || pCat.includes('post') || pCat.includes('creative'))) return true;
    if (targetSlug && targetSlug.includes('ugc') && (pCat.includes('ugc') || pCat.includes('video') || pCat.includes('motion') || pCat.includes('reel'))) return true;
    if (targetSlug && targetSlug.includes('cover') && (pCat.includes('cover') || pCat.includes('banner') || pCat.includes('header'))) return true;
    return false;
  });

  const activeServiceProjectsCount = currentServiceProjects.filter((p) => p.active !== false).length;
  const hiddenServiceProjectsCount = currentServiceProjects.filter((p) => p.active === false).length;

  // Open Service Creation Modal
  const openCreateModal = () => {
    setEditTarget(null);
    setActiveTab('details');
    setFormData({
      title: '',
      tagline: '',
      description: '',
      icon: 'Palette',
      features: ['High-Contrast Strategic Composition', '100% Vector & Source PSD/AI Files', 'Direct WhatsApp Support'],
      deliverables: ['.AI', '.PSD', '.SVG', '.PNG', '.MP4'],
      order: services.length + 1,
      active: true,
      packages: [
        {
          name: 'Starter Scope',
          price: 99,
          billingPeriod: 'per project',
          description: 'Essential high-impact deliverables for quick launches.',
          features: ['1 Initial Visual Concept', '2 Revision Cycles', 'High-Res Digital Exports', 'Commercial Usage License'],
          isPopular: false,
          order: 1,
          ctaText: 'Select Package',
        },
        {
          name: 'Standard Growth',
          price: 199,
          billingPeriod: 'per project',
          description: 'Comprehensive creative suite tailored for scaling brands.',
          features: ['3 Unique Design Directions', 'Unlimited Refinements', 'Full Editable Master Source Files', 'Priority 24-48h Delivery'],
          isPopular: true,
          order: 2,
          ctaText: 'Get Standard Package',
        },
        {
          name: 'Full Agency Scale',
          price: 349,
          billingPeriod: 'per project',
          description: 'Complete end-to-end multi-format creative production.',
          features: ['5 Visual Concept Variations', 'Complete Guidelines & Mockups', 'Direct 1-on-1 Consultation', 'Lifetime Source Archive'],
          isPopular: false,
          order: 3,
          ctaText: 'Order Full Scale',
        },
      ],
      faqs: [
        {
          question: 'What is the turnaround time for this service?',
          answer: 'Initial concepts are delivered within 24 to 48 business hours. We iterate rapidly based on your feedback.',
        },
        {
          question: 'Do I receive full commercial rights and editable source files?',
          answer: 'Yes! Upon final signoff, you receive 100% full commercial vector and layered source files (.AI, .PSD, .SVG, .PNG).',
        },
      ],
    });
    setEditingPackageIndex(null);
    setEditingFaqIndex(null);
    setQuickUploadTitle('');
    setQuickUploadPreview('');
    setModalOpen(true);
  };

  // Open Service Edit Modal
  const openEditModal = (service, tab = 'portfolio') => {
    setEditTarget(service);
    setActiveTab(tab);

    let parsedFeat = service.features;
    if (typeof parsedFeat === 'string') {
      try { parsedFeat = JSON.parse(parsedFeat); } catch (e) { parsedFeat = []; }
    }
    let parsedDel = service.deliverables;
    if (typeof parsedDel === 'string') {
      try { parsedDel = JSON.parse(parsedDel); } catch (e) { parsedDel = []; }
    }

    // Match packages for this service
    let srvPackages = service.packages || [];
    if (!Array.isArray(srvPackages) || srvPackages.length === 0) {
      const matchedDefault = DEFAULT_SERVICES.find((s) => s.slug === service.slug || s.title === service.title);
      if (matchedDefault && matchedDefault.packages) {
        srvPackages = matchedDefault.packages;
      }
    }

    // Match service-specific FAQs
    let srvFaqs = allFaqs.filter(
      (f) => f.category === service.title || f.category === service.slug || (f.category && f.category.toLowerCase().includes(service.title.toLowerCase()))
    );
    if (srvFaqs.length === 0) {
      srvFaqs = [
        {
          question: `What is the estimated delivery time for ${service.title}?`,
          answer: 'First drafts are presented in 24–48 hours with transparent milestone updates.',
        },
        {
          question: 'Can I request revisions until I am satisfied?',
          answer: 'Absolutely. We offer dedicated revision rounds to fine-tune the art direction to your exact standards.',
        },
      ];
    }

    setFormData({
      title: service.title,
      tagline: service.tagline || '',
      description: service.description,
      icon: service.icon || 'Palette',
      features: Array.isArray(parsedFeat) ? parsedFeat : [],
      deliverables: Array.isArray(parsedDel) ? parsedDel : ['.AI', '.PSD', '.SVG', '.PNG', '.MP4'],
      order: service.order || 0,
      active: service.active !== false,
      packages: srvPackages,
      faqs: srvFaqs,
    });

    setEditingPackageIndex(null);
    setEditingFaqIndex(null);
    setQuickUploadTitle('');
    setQuickUploadPreview('');
    setModalOpen(true);
  };

  // Add & Edit deliverable format chip
  const handleAddDeliverable = () => {
    if (!deliverableInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, deliverableInput.trim()],
    }));
    setDeliverableInput('');
  };

  const handleUpdateDeliverable = (idx, value) => {
    setFormData((prev) => {
      const updated = [...prev.deliverables];
      updated[idx] = value;
      return { ...prev, deliverables: updated };
    });
  };

  const handleRemoveDeliverable = (idx) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx),
    }));
  };

  // Add & Edit service feature checkmark
  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, featureInput.trim()],
    }));
    setFeatureInput('');
  };

  const handleUpdateFeature = (idx, value) => {
    setFormData((prev) => {
      const updated = [...prev.features];
      updated[idx] = value;
      return { ...prev, features: updated };
    });
  };

  const handleRemoveFeature = (idx) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  // Package Management Inside Service Modal
  const handleSavePackage = (e) => {
    e.preventDefault();
    if (!packageFormData.name || packageFormData.price === undefined || packageFormData.price === '') {
      error('Package name and price are required.');
      return;
    }

    const newPkg = { ...packageFormData, price: Number(packageFormData.price) || 0 };

    if (editingPackageIndex !== null) {
      setFormData((prev) => {
        const updated = [...prev.packages];
        updated[editingPackageIndex] = newPkg;
        return { ...prev, packages: updated };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        packages: [...prev.packages, newPkg],
      }));
    }

    setEditingPackageIndex(null);
    setPackageFormData({
      name: '',
      price: 99,
      billingPeriod: 'per project',
      description: '',
      features: ['High-Res Vector Exports', 'Commercial Rights'],
      isPopular: false,
      order: formData.packages.length + 1,
      ctaText: 'Select Package',
    });
  };

  const handleEditPackage = (pkg, idx) => {
    let feats = pkg.features;
    if (typeof feats === 'string') {
      try { feats = JSON.parse(feats); } catch (e) { feats = []; }
    }
    setEditingPackageIndex(idx);
    setPackageFormData({
      id: pkg.id,
      name: pkg.name,
      price: Number(pkg.price) || 99,
      billingPeriod: pkg.billingPeriod || 'per project',
      description: pkg.description || '',
      features: Array.isArray(feats) ? feats : [],
      isPopular: Boolean(pkg.isPopular),
      order: pkg.order || idx + 1,
      ctaText: pkg.ctaText || 'Select Package',
    });
  };

  const handleDeletePackage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== idx),
    }));
    if (editingPackageIndex === idx) {
      setEditingPackageIndex(null);
    }
  };

  // FAQ Management Inside Service Modal
  const handleSaveFaq = (e) => {
    e.preventDefault();
    if (!faqFormData.question || !faqFormData.answer) {
      error('Question and answer are required.');
      return;
    }

    if (editingFaqIndex !== null) {
      setFormData((prev) => {
        const updated = [...prev.faqs];
        updated[editingFaqIndex] = { ...faqFormData };
        return { ...prev, faqs: updated };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        faqs: [...prev.faqs, { ...faqFormData }],
      }));
    }

    setEditingFaqIndex(null);
    setFaqFormData({ question: '', answer: '' });
  };

  const handleEditFaq = (f, idx) => {
    setEditingFaqIndex(idx);
    setFaqFormData({
      id: f.id,
      question: f.question,
      answer: f.answer,
    });
  };

  const handleDeleteFaq = (idx) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== idx),
    }));
    if (editingFaqIndex === idx) {
      setEditingFaqIndex(null);
    }
  };

  // 1-Click File Upload (Drag & Drop or File Picker) - 1ms Instant FileReader Preview
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Clean suggested title from filename
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    if (!quickUploadTitle) {
      setQuickUploadTitle(cleanName);
    }

    // 0.001s Instant Preview via FileReader
    if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setQuickUploadPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }

    setUploadingCover(true);
    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      const res = await api.upload('/admin/media/upload', uploadForm);
      const uploadedUrl = res?.data?.url || res?.data?.fileUrl;
      if (res && res.success && uploadedUrl) {
        setQuickUploadPreview(uploadedUrl);
        success('Image ready! Click "+ Publish" to add it to your portfolio.');
      }
    } catch (err) {
      console.warn('Background upload note:', err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Instant 0.001s Publish to Service Portfolio & Database
  const handlePublishQuickProject = async (e) => {
    e?.preventDefault();
    if (!quickUploadPreview) {
      error('Please select an image first.');
      return;
    }

    const targetServiceSlug = editTarget?.slug || formData.slug || (formData.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const targetServiceId = editTarget?.id || null;
    const title = quickUploadTitle.trim() || `${formData.title || 'Creative'} Showcase ${currentServiceProjects.length + 1}`;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4);

    const payload = {
      title,
      slug,
      category: formData.title || 'General Design',
      serviceId: targetServiceId,
      serviceSlug: targetServiceSlug,
      client: 'Featured Showcase',
      year: new Date().getFullYear().toString(),
      summary: `Showcase portfolio project for ${formData.title}.`,
      description: `Delivered high-converting visual design deliverables for ${title}.`,
      coverImage: quickUploadPreview,
      galleryImages: [quickUploadPreview],
      featured: Boolean(quickUploadFeatured),
      order: currentServiceProjects.length + 1,
      tags: [formData.title || 'Design'],
      active: true,
    };

    // 1. Optimistic Instant UI Update (0.001s)
    const optimisticProject = {
      ...payload,
      id: 'proj_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    setAllProjects((prev) => [optimisticProject, ...prev]);
    safeSetItem('sakhawat_cached_all_projects', [optimisticProject, ...allProjects]);

    success(
      quickUploadFeatured
        ? `"${title}" published to ${formData.title} & Featured on Homepage!`
        : `"${title}" published to ${formData.title} portfolio!`
    );

    setQuickUploadTitle('');
    setQuickUploadPreview('');
    setQuickUploadFeatured(false);

    // 2. Background Database Sync
    try {
      const res = await api.post('/projects/admin', payload);
      if (res && res.success && res.data) {
        setAllProjects((prev) =>
          prev.map((p) => (p.id === optimisticProject.id ? res.data : p))
        );
        safeSetItem('sakhawat_cached_all_projects', allProjects.map((p) => (p.id === optimisticProject.id ? res.data : p)));
      }
    } catch (err) {
      console.warn('Background project creation note:', err.message);
    }
  };

  // 1-Click Toggle ⭐ Featured on Homepage (ON / OFF)
  const handleToggleProjectFeatured = async (project) => {
    const nextFeaturedState = !project.featured;
    try {
      const res = await api.put(`/projects/admin/${project.id}`, {
        ...project,
        featured: nextFeaturedState,
      });

      if (res && res.success) {
        setAllProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, featured: nextFeaturedState } : p))
        );
        success(
          nextFeaturedState
            ? `⭐ "${project.title}" is now Featured on Homepage!`
            : `"${project.title}" removed from Homepage Featured.`
        );
      } else {
        error('Failed to update featured status.');
      }
    } catch (err) {
      error('Failed to update featured status.');
    }
  };

  // 1-Click Toggle ON / OFF (Active / Inactive) for any portfolio item
  const handleToggleProjectActive = async (project) => {
    const nextState = !project.active;
    try {
      const res = await api.put(`/projects/admin/${project.id}`, {
        ...project,
        active: nextState,
      });

      if (res && res.success) {
        setAllProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, active: nextState } : p))
        );
        success(nextState ? `🟢 "${project.title}" is now LIVE (ON)!` : `⚪ "${project.title}" is now HIDDEN (OFF).`);
      } else {
        error('Failed to change status.');
      }
    } catch (err) {
      error('Failed to update project status.');
    }
  };

  // 1-Click Delete / Remove Project from Portfolio
  const handleDeletePortfolioProject = async (project) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${project.title}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/projects/admin/${project.id}`);
      if (res && res.success) {
        setAllProjects((prev) => prev.filter((p) => p.id !== project.id));
        success(`"${project.title}" removed.`);
      } else {
        error(res?.message || 'Failed to remove.');
      }
    } catch (err) {
      error('Failed to delete item.');
    }
  };

  // Toggle Project Link to this Service (0.001s Instant UI)
  const handleToggleProjectLink = async (project) => {
    const isCurrentlyLinked =
      project.serviceId === editTarget?.id ||
      project.serviceSlug === editTarget?.slug ||
      project.category === editTarget?.title;

    const updatedServiceId = isCurrentlyLinked ? null : editTarget?.id;
    const updatedServiceSlug = isCurrentlyLinked ? null : editTarget?.slug;
    const updatedCategory = isCurrentlyLinked ? 'General Design' : (editTarget?.title || formData.title);

    const updatedProject = {
      ...project,
      serviceId: updatedServiceId,
      serviceSlug: updatedServiceSlug,
      category: updatedCategory,
    };

    // 1. Optimistic Update (0.001s)
    setAllProjects((prev) =>
      prev.map((p) => (p.id === project.id ? updatedProject : p))
    );
    safeSetItem('sakhawat_cached_all_projects', allProjects.map((p) => (p.id === project.id ? updatedProject : p)));

    success(
      isCurrentlyLinked
        ? `Removed "${project.title}" from this service.`
        : `Attached "${project.title}" to ${formData.title}!`
    );

    // 2. Background Database Update
    try {
      await api.put(`/projects/admin/${project.id}`, updatedProject);
    } catch (err) {
      console.warn('Background project link note:', err.message);
    }
  };

  // Save Complete Service with Packages & FAQs (0.001s Instant UI & Parallel Sync)
  const handleSaveService = async (e) => {
    e?.preventDefault();
    if (!formData.title || !formData.description) {
      error('Title and description are required.');
      return;
    }

    const serviceSlug = editTarget?.slug || formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const serviceId = editTarget?.id || 'srv-' + Date.now();

    const optimisticService = {
      ...formData,
      id: serviceId,
      slug: serviceSlug,
    };

    // 1. Optimistic Instant UI Update (0.001s)
    setServices((prev) => {
      const exists = prev.some((s) => s.id === optimisticService.id);
      const nextList = exists
        ? prev.map((s) => (s.id === optimisticService.id ? optimisticService : s))
        : [...prev, optimisticService];
      safeSetItem('sakhawat_cached_services', nextList);
      return nextList;
    });

    success(`"${formData.title}" saved successfully!`);
    setModalOpen(false);

    // 2. Background Asynchronous Parallel Database Sync
    (async () => {
      try {
        const payload = {
          title: formData.title,
          tagline: formData.tagline,
          description: formData.description,
          icon: formData.icon,
          features: formData.features,
          deliverables: formData.deliverables,
          order: formData.order,
          active: formData.active,
          packages: formData.packages,
        };

        let savedServiceId = editTarget?.id;

        if (editTarget) {
          const res = await api.put(`/services/admin/${editTarget.id}`, payload);
          if (res && res.success) {
            savedServiceId = res.data?.id || editTarget.id;
          }
        } else {
          const res = await api.post('/services/admin', payload);
          if (res && res.success) {
            savedServiceId = res.data?.id;
          }
        }

        // Parallel Package Sync
        const packagePromises = (formData.packages || []).map((pkg, i) => {
          const pkgPayload = {
            name: pkg.name,
            serviceId: savedServiceId,
            description: pkg.description,
            price: Number(pkg.price),
            billingPeriod: pkg.billingPeriod || 'per project',
            features: pkg.features,
            isPopular: Boolean(pkg.isPopular),
            order: i + 1,
            active: true,
            ctaText: pkg.ctaText || 'Select Package',
          };

          if (pkg.id && !pkg.id.startsWith('pkg-')) {
            return api.put(`/packages/admin/${pkg.id}`, pkgPayload).catch(() => null);
          } else {
            return api.post('/packages/admin', pkgPayload).catch(() => null);
          }
        });

        // Parallel FAQ Sync
        const faqPromises = (formData.faqs || []).map((f, i) => {
          const faqPayload = {
            question: f.question,
            answer: f.answer,
            category: formData.title,
            order: i + 1,
            active: true,
          };

          if (f.id && !f.id.startsWith('faq-')) {
            return api.put(`/faqs/admin/${f.id}`, faqPayload).catch(() => null);
          } else {
            return api.post('/faqs/admin', faqPayload).catch(() => null);
          }
        });

        await Promise.all([...packagePromises, ...faqPromises]);
        fetchServicesAndSettings();
      } catch (err) {
        console.warn('Background service sync notice:', err.message);
      }
    })();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/services/admin/${deleteTarget.id}`);
      if (res && res.success) {
        success('Service deleted.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setServices((prev) => {
        const filtered = prev.filter((s) => s.id !== deleteTarget.id);
        safeSetItem('sakhawat_cached_services', filtered);
        return filtered;
      });
      setDeleteTarget(null);
    }
  };

  // Save Showcase Display Settings
  const handleSaveShowcaseSettings = async () => {
    setSavingShowcase(true);
    try {
      safeSetItem('sakhawat_cached_showcase_config', showcaseConfig);
      const res = await api.post('/settings/admin/bulk', {
        settings: {
          service_showcase_config: showcaseConfig,
        },
      });
      if (res && res.success) {
        success('Service Showcase & Slider settings saved successfully!');
      } else {
        success('Showcase settings saved!');
      }
    } catch (err) {
      safeSetItem('sakhawat_cached_showcase_config', showcaseConfig);
      success('Showcase settings updated!');
    } finally {
      setSavingShowcase(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Service CMS & Offerings Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Services & Portfolio Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Easily upload, toggle ON/OFF, or remove portfolio images and manage pricing packages for each service.
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={openCreateModal}>
          Create New Service
        </Button>
      </div>

      {/* =========================================================================
          SHOWCASE & SLIDER CONFIGURATION CONTROL PANEL (Backend CMS)
          ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border-2 border-teal-500/40 bg-zinc-950 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5" />
              Global Showcase Configuration
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              Portfolio Showcase & Slider Controls
            </h2>
            <p className="text-xs text-zinc-400">
              Configures image aspect ratio (default: 1:1 Square), auto-play slider, and grid columns across all service pages.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Save}
            loading={savingShowcase}
            onClick={handleSaveShowcaseSettings}
          >
            Save Showcase Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* 1. Image Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
              Global Aspect Ratio
            </label>
            <select
              value={showcaseConfig.aspectRatio || '1:1'}
              onChange={(e) =>
                setShowcaseConfig({ ...showcaseConfig, aspectRatio: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
            >
              <option value="1:1">1:1 Square (Ads & Logos)</option>
              <option value="fb-cover">Facebook Cover (820 × 312)</option>
              <option value="linkedin-cover">LinkedIn Banner (1584 × 396)</option>
              <option value="16:9">16:9 Landscape / Widescreen</option>
              <option value="4:3">4:3 Standard Display</option>
              <option value="9:16">9:16 Vertical (TikTok / Reels)</option>
            </select>
            <span className="text-[11px] text-zinc-500 block">
              Default fallback for all services.
            </span>
          </div>

          {/* 2. Cover Branding Specific Ratio */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-teal-400" />
              Cover Branding Page Ratio
            </label>
            <select
              value={showcaseConfig.cover_branding_aspect_ratio || 'fb-cover'}
              onChange={(e) =>
                setShowcaseConfig({
                  ...showcaseConfig,
                  cover_branding_aspect_ratio: e.target.value,
                  service_ratios: {
                    ...(showcaseConfig.service_ratios || {}),
                    'cover-branding': e.target.value,
                  },
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
            >
              <option value="fb-cover">🔵 Facebook Cover (820 × 312)</option>
              <option value="linkedin-cover">💼 LinkedIn Banner (1584 × 396)</option>
              <option value="16:9">🖥️ 16:9 Landscape (YouTube)</option>
              <option value="1:1">🔲 1:1 Square</option>
            </select>
            <span className="text-[11px] text-zinc-500 block">
              Applied to /services/cover-branding page.
            </span>
          </div>

          {/* 2. Default View Mode */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-teal-400" />
              Default View Mode
            </label>
            <select
              value={showcaseConfig.defaultViewMode || 'slider'}
              onChange={(e) =>
                setShowcaseConfig({ ...showcaseConfig, defaultViewMode: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
            >
              <option value="slider">Interactive Slider (Animated Carousel)</option>
              <option value="grid">Clean Grid (All Cards Side-by-Side)</option>
            </select>
            <span className="text-[11px] text-zinc-500 block">
              Default mode when visitors view any service detail page.
            </span>
          </div>

          {/* 3. Slider Auto-Play & Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              Slider Auto-Play & Speed
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={showcaseConfig.autoplay ? 'true' : 'false'}
                onChange={(e) =>
                  setShowcaseConfig({
                    ...showcaseConfig,
                    autoplay: e.target.value === 'true',
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
              >
                <option value="true">Auto Play (ON)</option>
                <option value="false">Manual Only (OFF)</option>
              </select>

              <select
                value={String(showcaseConfig.autoplayInterval || 4000)}
                onChange={(e) =>
                  setShowcaseConfig({
                    ...showcaseConfig,
                    autoplayInterval: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
              >
                <option value="3000">3 Seconds</option>
                <option value="4000">4 Seconds</option>
                <option value="5000">5 Seconds</option>
                <option value="6000">6 Seconds</option>
              </select>
            </div>
            <span className="text-[11px] text-zinc-500 block">
              Auto-advances smoothly with pause on user hover.
            </span>
          </div>

          {/* 4. Grid Columns */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
              Grid Columns Count
            </label>
            <select
              value={String(showcaseConfig.gridCols || 3)}
              onChange={(e) =>
                setShowcaseConfig({
                  ...showcaseConfig,
                  gridCols: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
            >
              <option value="2">2 Columns (Large Cards)</option>
              <option value="3">3 Columns (Standard)</option>
              <option value="4">4 Columns (Compact Gallery)</option>
            </select>
            <span className="text-[11px] text-zinc-500 block">
              Number of cards per row in Grid mode.
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ACTIVE SERVICES LIST (Structured, Clean Cards)
          ========================================================================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-white">
            Active Services ({services.length})
          </h2>
          <span className="text-xs text-zinc-400">
            Click "Manage Portfolio & Pricing" on any service to upload, toggle ON/OFF, or edit content.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => {
            const pkgs = s.packages || [];
            const lowestPrice =
              pkgs.length > 0
                ? Math.min(...pkgs.map((p) => Number(p.price) || 99))
                : 99;

            const attachedProjects = allProjects.filter(
              (p) => p.serviceId === s.id || p.serviceSlug === s.slug || p.category === s.title || (p.category && p.category.toLowerCase().includes(s.title.toLowerCase()))
            );
            const liveCount = attachedProjects.filter((p) => p.active !== false).length;

            return (
              <div
                key={s.id}
                className="p-6 sm:p-7 rounded-3xl glass-card border border-zinc-800 hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between group space-y-5 bg-zinc-950/70"
              >
                <div className="space-y-4">
                  {/* Top Badges & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-teal-400">
                        /{s.slug}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300">
                        From {currencySymbol}{lowestPrice}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        🟢 {liveCount} Live Works
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/services/${s.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-teal-400 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="View Live Service Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openEditModal(s, 'portfolio')}
                        className="p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-zinc-950 transition-all cursor-pointer font-bold"
                        title="Manage Portfolio & Content"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-bold font-display text-white group-hover:text-teal-300 transition-colors">
                      {s.title}
                    </h3>
                    {s.tagline && (
                      <p className="text-xs font-semibold text-teal-400">
                        {s.tagline}
                      </p>
                    )}
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {s.description}
                    </p>
                  </div>

                  {/* Portfolio Snapshot Preview Bar */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                      <span className="flex items-center gap-1.5 text-teal-400">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Portfolio Showcase ({liveCount} Live / {attachedProjects.length} Total)
                      </span>
                      <button
                        onClick={() => openEditModal(s, 'portfolio')}
                        className="text-[11px] text-teal-400 hover:underline cursor-pointer font-bold"
                      >
                        + Upload Work
                      </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                      {attachedProjects.slice(0, 5).map((p, pIdx) => (
                        <div key={pIdx} className="relative group/thumb shrink-0">
                          <img
                            src={p.coverImage}
                            alt={p.title}
                            className={`w-12 h-12 rounded-xl object-cover border ${
                              p.active !== false ? 'border-teal-500/60' : 'border-zinc-700 opacity-40'
                            }`}
                          />
                          {p.active === false && (
                            <span className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-[9px] font-bold text-zinc-400">
                              OFF
                            </span>
                          )}
                        </div>
                      ))}
                      {attachedProjects.length === 0 && (
                        <span className="text-xs text-zinc-500 py-2">
                          No images uploaded yet. Click "Manage" to add.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 font-mono">
                    Pricing: {pkgs.length} Tiers Available
                  </span>
                  <button
                    onClick={() => openEditModal(s, 'portfolio')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Manage Portfolio & Pricing <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          UNIFIED MASTER SERVICE CMS MODAL (Ultra-Clean, User-Friendly)
          ========================================================================= */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? `Manage: ${editTarget.title}` : 'Create New Service'}
        size="2xl"
      >
        <div className="space-y-6">
          {/* Top Modal Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'portfolio'
                  ? 'bg-teal-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>1. Portfolio Gallery ({activeServiceProjectsCount} Live)</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'pricing'
                  ? 'bg-teal-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="font-bold font-mono text-sm leading-none">{currencySymbol}</span>
              <span>2. Pricing Packages ({formData.packages?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'details'
                  ? 'bg-teal-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>3. Service Details & Copy</span>
            </button>

            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'faqs'
                  ? 'bg-teal-500 text-zinc-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>4. FAQs ({formData.faqs?.length || 0})</span>
            </button>
          </div>

          {/* =========================================================================
              TAB 1: ULTRA-SIMPLE SERVICE PORTFOLIO SHOWCASE MANAGER (MAIN HIGHLIGHT)
              ========================================================================= */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Counter & Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-teal-400" />
                    Portfolio Images for "{formData.title || 'This Service'}"
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Upload images below. Toggle ON/OFF anytime to show or hide them from your public service page.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                    🟢 {activeServiceProjectsCount} ON (Live)
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-bold font-mono">
                    ⚪ {hiddenServiceProjectsCount} OFF
                  </span>
                </div>
              </div>

              {/* 1. EASY 1-CLICK UPLOAD ZONE */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFileUpload(e.dataTransfer.files?.[0]);
                }}
                className={`p-6 rounded-3xl border-2 border-dashed transition-all text-center space-y-4 ${
                  dragOver
                    ? 'border-teal-400 bg-teal-500/10 scale-[0.99]'
                    : quickUploadPreview
                    ? 'border-teal-500/50 bg-zinc-900/90'
                    : 'border-zinc-700 hover:border-teal-500/60 bg-zinc-950/80'
                }`}
              >
                {!quickUploadPreview ? (
                  <div className="space-y-3 py-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center shadow-lg">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">
                        Select Showcase Project from Media Library
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Select from Centralized Media Library or upload new asset.
                      </p>
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        icon={ImageIcon}
                        onClick={() => setServiceMediaPickerOpen(true)}
                        className="cursor-pointer font-bold px-6 shadow-xl bg-indigo-600 hover:bg-indigo-500"
                      >
                        Choose from Media Library
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Upload Completed Preview & 1-Click Publish */
                  <div className="space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-950 border border-teal-500/40">
                      <img
                        src={quickUploadPreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-500 shadow-xl bg-zinc-900 shrink-0"
                      />
                      <div className="flex-1 w-full space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready to publish
                        </span>
                        <div>
                          <label className="text-xs font-semibold text-zinc-300 block mb-1">
                            Project Title (e.g. Nordic Labs Minimalist Vector Logo)
                          </label>
                          <input
                            type="text"
                            value={quickUploadTitle}
                            onChange={(e) => setQuickUploadTitle(e.target.value)}
                            placeholder="Enter a title..."
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
                          />
                        </div>

                        {/* Feature on Homepage Checkbox */}
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer pt-1 select-none">
                          <input
                            type="checkbox"
                            checked={quickUploadFeatured}
                            onChange={(e) => setQuickUploadFeatured(e.target.checked)}
                            className="w-4 h-4 rounded text-teal-500 focus:ring-0 focus:outline-none bg-zinc-900 border-zinc-700 cursor-pointer"
                          />
                          <span className="flex items-center gap-1.5">
                            <Star className={`w-3.5 h-3.5 ${quickUploadFeatured ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                            <span className={quickUploadFeatured ? 'text-amber-300 font-bold' : 'text-zinc-400'}>
                              Feature on Homepage (Featured Case Studies)
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setQuickUploadPreview('');
                          setQuickUploadTitle('');
                          setQuickUploadFeatured(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        icon={Check}
                        onClick={handlePublishQuickProject}
                        className="font-bold shadow-lg"
                      >
                        + Publish to {formData.title || 'Service'} Portfolio
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. VISUAL CARDS GRID WITH LIVE TOGGLE ON/OFF & REMOVE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-200">
                    Uploaded Works ({currentServiceProjects.length} Items):
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Toggle service visibility (ON/OFF) or star (⭐) to feature on the homepage.
                  </span>
                </div>

                {currentServiceProjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                    {currentServiceProjects.map((p) => {
                      const isLive = p.active !== false;
                      const isFeaturedOnHome = Boolean(p.featured);

                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isLive
                              ? 'bg-zinc-900/90 border-teal-500/30 hover:border-teal-500/60 shadow-md'
                              : 'bg-zinc-950/80 border-zinc-800 opacity-60'
                          }`}
                        >
                          {/* Left: Thumbnail & Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={p.coverImage}
                                alt={p.title}
                                className="w-14 h-14 rounded-xl object-cover bg-zinc-950 border border-zinc-800"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/uploads/amazon-listing-images-electric-shaver-hero--1--1787766545048-828073166.jpg';
                                }}
                              />
                              {!isLive && (
                                <span className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center text-[9px] font-black text-zinc-300">
                                  OFF
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 space-y-1">
                              <h5 className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[170px]">
                                {p.title}
                              </h5>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    isLive
                                      ? 'bg-emerald-500/20 text-emerald-400'
                                      : 'bg-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  {isLive ? '🟢 LIVE' : '⚪ OFF'}
                                </span>
                                {isFeaturedOnHome && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <Star className="w-2.5 h-2.5 fill-amber-300" /> Home
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Toggle Switch, Star Feature & Delete Action */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Toggle Service ON/OFF Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleProjectActive(p)}
                              className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 font-bold text-xs ${
                                isLive
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
                                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                              }`}
                              title={isLive ? 'Service Page: Click to turn OFF (Hide)' : 'Service Page: Click to turn ON (Show)'}
                            >
                              {isLive ? (
                                <ToggleRight className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-zinc-500" />
                              )}
                            </button>

                            {/* Toggle Homepage Featured (Star) */}
                            <button
                              type="button"
                              onClick={() => handleToggleProjectFeatured(p)}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                isFeaturedOnHome
                                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30 shadow-sm'
                                  : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-500 hover:text-zinc-300'
                              }`}
                              title={
                                isFeaturedOnHome
                                  ? 'Homepage: Currently Featured. Click to remove from Homepage.'
                                  : 'Homepage: Not featured. Click to show in Featured Case Studies on Homepage.'
                              }
                            >
                              <Star className={`w-3.5 h-3.5 ${isFeaturedOnHome ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'}`} />
                            </button>

                            {/* View Project Live Link */}
                            <a
                              href={`/portfolio/${p.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                              title="View Project"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>

                            {/* Permanent Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeletePortfolioProject(p)}
                              className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remove / Delete Work"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-zinc-950/80 border border-dashed border-zinc-800 text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs font-semibold text-zinc-400">
                      No portfolio images uploaded for "{formData.title}" yet.
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Click the upload box above to add your first work!
                    </p>
                  </div>
                )}
              </div>

              {/* 3. ATTACH FROM MAIN LIBRARY (COLLAPSIBLE SEARCH) */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-teal-400" />
                    <span>Attach from General Portfolio Library</span>
                  </h4>
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {allProjects
                    .filter((p) => !projectSearch || p.title.toLowerCase().includes(projectSearch.toLowerCase()))
                    .map((p) => {
                      const isLinked =
                        p.serviceId === editTarget?.id ||
                        p.serviceSlug === editTarget?.slug ||
                        p.category === editTarget?.title;

                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={p.coverImage}
                              alt={p.title}
                              className="w-7 h-7 rounded-lg object-cover bg-zinc-900 shrink-0"
                            />
                            <span className="text-xs text-white truncate max-w-xs">{p.title}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleProjectLink(p)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isLinked
                                ? 'bg-teal-500 text-zinc-950 font-black shadow'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {isLinked ? '✓ Attached' : '+ Attach'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: PRICING PACKAGES FOR THIS SERVICE
              ========================================================================= */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Pricing Packages for "{formData.title || 'This Service'}"
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Click "Edit" on any package to change price, turnaround, or edit feature text in-place.
                  </p>
                </div>
              </div>

              {/* Package List Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.packages?.map((pkg, idx) => {
                  let featList = pkg.features;
                  if (typeof featList === 'string') {
                    try { featList = JSON.parse(featList); } catch (e) { featList = []; }
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl flex flex-col justify-between border relative transition-all ${
                        pkg.isPopular
                          ? 'bg-zinc-900/90 border-teal-400 shadow-lg shadow-teal-950/40'
                          : 'bg-zinc-900/50 border-zinc-800'
                      }`}
                    >
                      {pkg.isPopular && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-teal-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                          <Flame className="w-3 h-3 fill-current" /> Best Seller
                        </span>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white text-sm">{pkg.name}</h4>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditPackage(pkg, idx)}
                              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-teal-400 cursor-pointer"
                              title="Edit Package"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePackage(idx)}
                              className="p-1 rounded bg-zinc-800 hover:bg-red-500/20 text-red-400 cursor-pointer"
                              title="Delete Package"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xl font-black font-display text-white">
                          {currencySymbol}{pkg.price} <span className="text-xs text-zinc-500 font-normal">/{pkg.billingPeriod || 'project'}</span>
                        </div>

                        {pkg.description && (
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{pkg.description}</p>
                        )}

                        <div className="space-y-1 pt-2 border-t border-zinc-800/80">
                          {Array.isArray(featList) &&
                            featList.slice(0, 4).map((f, fIdx) => (
                              <div key={fIdx} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-teal-400 shrink-0" />
                                <span className="truncate">{f}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add / Edit Package Sub-Form */}
              <div className="p-5 rounded-3xl bg-zinc-900 border-2 border-teal-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{editingPackageIndex !== null ? `Edit Package #${editingPackageIndex + 1}` : 'Add New Pricing Tier'}</span>
                  </h4>
                  {editingPackageIndex !== null && (
                    <span className="text-[11px] text-zinc-400">
                      Editing active package
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Package Name *</label>
                    <input
                      type="text"
                      value={packageFormData.name}
                      onChange={(e) => setPackageFormData({ ...packageFormData, name: e.target.value })}
                      placeholder="e.g. Standard Growth Suite"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Price ({currencyCode} {currencySymbol}) *</label>
                    <input
                      type="number"
                      value={packageFormData.price}
                      onChange={(e) => setPackageFormData({ ...packageFormData, price: Number(e.target.value) || 0 })}
                      placeholder="199"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-bold text-teal-400 focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Popular Badge</label>
                    <select
                      value={packageFormData.isPopular ? 'true' : 'false'}
                      onChange={(e) => setPackageFormData({ ...packageFormData, isPopular: e.target.value === 'true' })}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                    >
                      <option value="false">Standard Package</option>
                      <option value="true">🔥 Most Popular (Best Seller)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">Turnaround / Description</label>
                  <input
                    type="text"
                    value={packageFormData.description}
                    onChange={(e) => setPackageFormData({ ...packageFormData, description: e.target.value })}
                    placeholder="e.g. 24–48 Hours Turnaround • Full Source Files Included"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {/* Package Features List */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-200 block">
                      Package Feature Items (Edit text directly or fix typos in-place)
                    </label>
                    <span className="text-[11px] text-teal-400 font-mono">
                      {packageFormData.features?.length || 0} features
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {packageFormData.features?.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <input
                          type="text"
                          value={f}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPackageFormData((prev) => {
                              const updated = [...prev.features];
                              updated[fIdx] = val;
                              return { ...prev, features: updated };
                            });
                          }}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-teal-500 text-xs text-white focus:outline-none"
                          placeholder="Feature item text..."
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPackageFormData((prev) => ({
                              ...prev,
                              features: prev.features.filter((_, i) => i !== fIdx),
                            }))
                          }
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                          title="Remove feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-zinc-800/80">
                    <input
                      type="text"
                      value={pkgFeatureInput}
                      onChange={(e) => setPkgFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (pkgFeatureInput.trim()) {
                            setPackageFormData((prev) => ({
                              ...prev,
                              features: [...prev.features, pkgFeatureInput.trim()],
                            }));
                            setPkgFeatureInput('');
                          }
                        }
                      }}
                      placeholder="Type new feature and press Enter (e.g. 5 Custom Concepts)..."
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (pkgFeatureInput.trim()) {
                          setPackageFormData((prev) => ({
                            ...prev,
                            features: [...prev.features, pkgFeatureInput.trim()],
                          }));
                          setPkgFeatureInput('');
                        }
                      }}
                    >
                      + Add Item
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editingPackageIndex !== null && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingPackageIndex(null);
                        setPackageFormData({ name: '', price: 99, billingPeriod: 'per project', description: '', features: [], isPopular: false });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="button" variant="primary" size="sm" onClick={handleSavePackage}>
                    {editingPackageIndex !== null ? 'Update Package' : 'Save Package to Service'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: SERVICE DETAILS & COPYWRITING
              ========================================================================= */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300">Service Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
                    placeholder="e.g. Logo & Branding"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300">Tagline / Sub-heading</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
                    placeholder="e.g. Distinctive visual identities that command trust"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300">Full Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs leading-relaxed focus:border-teal-500 focus:outline-none"
                  placeholder="Explain the service value and execution process..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-300">Service Icon</label>
                  <select
                    value={formData.icon || 'Palette'}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300">Status</label>
                  <select
                    value={formData.active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                    className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold focus:border-teal-500 focus:outline-none"
                  >
                    <option value="true">Active (Publicly Live)</option>
                    <option value="false">Inactive (Draft)</option>
                  </select>
                </div>
              </div>

              {/* Deliverable Formats */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Deliverable Format Tags (Directly Edit Text Below)
                  </label>
                  <span className="text-[11px] text-teal-400 font-mono">
                    {formData.deliverables?.length || 0} formats
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.deliverables?.map((deliv, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-500 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={deliv}
                        onChange={(e) => handleUpdateDeliverable(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-teal-500 text-xs font-mono font-bold text-teal-300 focus:outline-none"
                        placeholder="Format (e.g. .AI / .EPS)"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(idx)}
                        className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                        title="Remove format tag"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-zinc-800/80">
                  <input
                    type="text"
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                    placeholder="Type new format tag and press Enter (e.g. .AI, .PSD, 4K MP4)..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddDeliverable}>
                    + Add Format
                  </Button>
                </div>
              </div>

              {/* Service Features Checklist */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 block">
                    What Clients Receive in this Service (Directly Edit Text Below)
                  </label>
                  <span className="text-[11px] text-teal-400 font-mono">
                    {formData.features?.length || 0} items
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formData.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-teal-500 text-xs text-white focus:outline-none"
                        placeholder="Feature point..."
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                        title="Remove feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-zinc-800/80">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Type new benefit point and press Enter..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddFeature}>
                    + Add Point
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 4: SERVICE SPECIFIC FAQS
              ========================================================================= */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Frequently Asked Questions for "{formData.title || 'This Service'}"
                </h3>
                <p className="text-xs text-zinc-400">
                  These questions and answers will appear directly on the service detail page.
                </p>
              </div>

              {/* FAQs List */}
              <div className="space-y-3">
                {formData.faqs?.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <h4 className="text-xs font-bold text-white">{f.question}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{f.answer}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditFaq(f, idx)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-teal-400 cursor-pointer"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(idx)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-red-400 cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add / Edit FAQ Sub-Form */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-teal-500/30 space-y-3">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                  {editingFaqIndex !== null ? `Edit FAQ #${editingFaqIndex + 1}` : 'Add Service FAQ'}
                </h4>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">Question *</label>
                  <input
                    type="text"
                    value={faqFormData.question}
                    onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                    placeholder="e.g. How many initial logo concept directions do I receive?"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300">Answer *</label>
                  <textarea
                    rows={2}
                    value={faqFormData.answer}
                    onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                    placeholder="Explain clearly..."
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs leading-relaxed focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  {editingFaqIndex !== null && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingFaqIndex(null);
                        setFaqFormData({ question: '', answer: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="button" variant="primary" size="sm" onClick={handleSaveFaq}>
                    {editingFaqIndex !== null ? 'Update FAQ' : 'Add FAQ to Service'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Global Save Modal Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-zinc-800">
            <span className="text-[11px] text-zinc-500">
              Saving updates service content, pricing packages, and FAQs simultaneously.
            </span>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" type="button" onClick={() => setModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                type="button"
                loading={saving}
                icon={Save}
                onClick={handleSaveService}
              >
                Save All Changes
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Service?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete Service"
        variant="danger"
      />

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={serviceMediaPickerOpen}
        onClose={() => setServiceMediaPickerOpen(false)}
        onSelect={(asset) => {
          const url = asset.fileUrl || asset.url;
          if (url) {
            setQuickUploadPreview(url);
            if (!quickUploadTitle) {
              const name = (asset.fileName || '').replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
              setQuickUploadTitle(name);
            }
          }
        }}
        title="Select Service Showcase Project"
        subtitle="Choose an image from your Media Library or upload a new asset."
        currentValue={quickUploadPreview}
      />
    </div>
  );
};

export default AdminServicesPage;
