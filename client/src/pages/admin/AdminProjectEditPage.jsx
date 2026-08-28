import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Figma,
  Github,
  ExternalLink,
  Plus,
  Trash,
  Upload,
  Sparkles,
  Layers,
  Tag,
  Wrench,
  Globe,
  Search,
} from 'lucide-react';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { MediaSelectField } from '../../components/common/MediaSelectField';
import { MediaPickerModal } from '../../components/common/MediaPickerModal';

const DESIGN_CATEGORIES = [
  'Logo & Branding',
  'Ads Creative',
  'UGC Video',
  'Cover Branding',
  'E-Commerce',
  'Social Media',
  'Product Design',
  'Thumbnail',
  'Print Design',
  'AI Video',
];

const AdminProjectEditPage = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [servicesList, setServicesList] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Logo & Branding',
    serviceId: '',
    serviceSlug: '',
    client: '',
    year: new Date().getFullYear().toString(),
    summary: '',
    description: '',
    coverImage: '',
    galleryImages: [],
    liveUrl: '',
    behanceUrl: '',
    dribbbleUrl: '',
    figmaUrl: '',
    githubUrl: '',
    featured: false,
    order: 0,
    tags: ['Adobe Photoshop', 'Illustrator', 'Figma'],
    tools: ['Photoshop', 'Illustrator', 'Premiere Pro'],
    challenges: '',
    solutions: '',
    results: '',
    goal: '',
    solution: '',
    seoTitle: '',
    seoDescription: '',
    altText: '',
    active: true,
  });

  const [tagInput, setTagInput] = useState('');
  const [toolInput, setToolInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false);

  useEffect(() => {
    // Fetch available services for assignment
    api.get('/services/admin/all')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setServicesList(res.data);
        }
      })
      .catch(() => {});

    if (!isNew) {
      setLoading(true);
      api.get(`/projects/admin/all`)
        .then((res) => {
          if (res && res.success && Array.isArray(res.data)) {
            const found = res.data.find((p) => p && p.id === id);
            if (found) {
              let parsedTags = found.tags;
              if (typeof parsedTags === 'string') {
                try {
                  parsedTags = JSON.parse(parsedTags);
                } catch (e) {
                  parsedTags = [];
                }
              }
              let parsedTools = found.tools;
              if (typeof parsedTools === 'string') {
                try {
                  parsedTools = JSON.parse(parsedTools);
                } catch (e) {
                  parsedTools = [];
                }
              }
              let parsedGallery = found.galleryImages;
              if (typeof parsedGallery === 'string') {
                try {
                  parsedGallery = JSON.parse(parsedGallery);
                } catch (e) {
                  parsedGallery = [];
                }
              }

              setFormData({
                ...found,
                serviceId: found.serviceId || '',
                serviceSlug: found.serviceSlug || '',
                tags: Array.isArray(parsedTags) ? parsedTags : [],
                tools: Array.isArray(parsedTools) ? parsedTools : [],
                galleryImages: Array.isArray(parsedGallery) ? parsedGallery : [],
                goal: found.goal || found.challenges || '',
                solution: found.solution || found.solutions || '',
                seoTitle: found.seoTitle || '',
                seoDescription: found.seoDescription || '',
                altText: found.altText || '',
              });
            } else {
              error('Project not found.');
              navigate('/admin/projects');
            }
          }
        })
        .catch((err) => error('Error loading project: ' + err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isNew, navigate]);

  const handleServiceChange = (e) => {
    const sId = e.target.value;
    const foundService = servicesList.find((s) => s.id === sId);
    setFormData((prev) => ({
      ...prev,
      serviceId: sId,
      serviceSlug: foundService ? foundService.slug : '',
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagToRemove),
    });
  };

  const handleAddTool = () => {
    if (toolInput.trim() && !formData.tools.includes(toolInput.trim())) {
      setFormData({ ...formData, tools: [...formData.tools, toolInput.trim()] });
      setToolInput('');
    }
  };

  const handleRemoveTool = (toolToRemove) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((t) => t !== toolToRemove),
    });
  };

  const handleAddGalleryImage = () => {
    if (galleryInput.trim() && !formData.galleryImages.includes(galleryInput.trim())) {
      setFormData({
        ...formData,
        galleryImages: [...formData.galleryImages, galleryInput.trim()],
      });
      setGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (index) => {
    setFormData({
      ...formData,
      galleryImages: formData.galleryImages.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const data = new FormData();
    data.append('file', file);
    data.append('altText', formData.title || 'Project Showcase');

    try {
      const res = await api.upload('/admin/media/upload', data);
      if (res.success && res.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, coverImage: res.data.fileUrl }));
        success('Cover image uploaded successfully.');
      }
    } catch (err) {
      error('Image upload failed: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.summary || !formData.coverImage) {
      error('Please complete Title, Category, Summary, and Cover Image.');
      return;
    }
    setConfirmSaveOpen(true);
  };

  const executeSaveProject = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const res = await api.post('/projects/admin', formData);
        if (res.success) {
          success('Project created successfully!');
          navigate('/admin/projects');
        }
      } else {
        const res = await api.put(`/projects/admin/${id}`, formData);
        if (res.success) {
          success('Project updated successfully!');
          navigate('/admin/projects');
        }
      }
    } catch (err) {
      error(err.message || 'Failed to save project.');
    } finally {
      setSaving(false);
      setConfirmSaveOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => navigate('/admin/projects')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <h1 className="text-xl font-bold font-display text-white">
          {isNew ? 'Create New Showcase Project' : `Edit: ${formData.title}`}
        </h1>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            form="project-form"
            variant="primary"
            size="sm"
            icon={Save}
            loading={saving}
          >
            {isNew ? 'Publish Project' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form id="project-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Core Details & Service Relationship */}
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">1. Core Details & Service Relationship</h3>
              <p className="text-xs text-zinc-400">
                Link this project to a Core Service (e.g. Ads Creative) and assign portfolio category filters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Luxury Perfume Ads Campaign"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                URL Slug (Auto-generated if empty)
              </label>
              <input
                type="text"
                placeholder="luxury-perfume-ads-campaign"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Service Relationship Dropdown */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Associated Service</span>
              </label>
              <select
                value={formData.serviceId}
                onChange={handleServiceChange}
                className="w-full bg-zinc-950 border border-teal-500/40 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-400 focus:outline-none"
              >
                <option value="">-- Standalone (No Direct Service) --</option>
                {servicesList.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.title} ({srv.slug})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Shown automatically under the service's dedicated page.
              </span>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Portfolio Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              >
                {DESIGN_CATEGORIES.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Client / Brand */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Client / Brand Name
              </label>
              <input
                type="text"
                placeholder="e.g. ORA Organic / Optiva Max"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Year
              </label>
              <input
                type="text"
                placeholder="2025"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded bg-zinc-950 border-zinc-800 text-teal-500 focus:ring-teal-500"
                />
                <span>⭐ Featured on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded bg-zinc-950 border-zinc-800 text-teal-500 focus:ring-teal-500"
                />
                <span>Published (Active)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Short Summary / Teaser *
            </label>
            <textarea
              rows={2}
              placeholder="A brief 1-2 sentence overview shown in grid cards and search previews..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Full Case Study Narrative *
            </label>
            <textarea
              rows={5}
              placeholder="Detailed explanation of the creative direction, target audience, visual hierarchy, typography pairings, and marketing results..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Section 2: Goals, Solutions & Tools */}
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">2. Problem, Creative Solution & Tools</h3>
              <p className="text-xs text-zinc-400">Structured narrative blocks rendered on the project detail page.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                The Objective / Challenge
              </label>
              <textarea
                rows={3}
                placeholder="What business problem or marketing bottleneck did the client face?"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value, challenges: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                The Creative Solution & Impact
              </label>
              <textarea
                rows={3}
                placeholder="How did our design strategy solve it? (e.g. +40% higher CTR, 3.2x ROAS)"
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value, solutions: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tools & Software Badges */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
              Tools & Software Used
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add software tool (e.g. Photoshop, Illustrator, Premiere Pro)..."
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
              <Button variant="secondary" size="sm" onClick={handleAddTool} icon={Plus}>
                Add Tool
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tools.map((tool, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold"
                >
                  <span>{tool}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(tool)}
                    className="hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Visuals & Media */}
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">3. Showcase Visuals & Gallery</h3>
              <p className="text-xs text-zinc-400">Cover image and multiple high-res gallery previews.</p>
            </div>
          </div>

          {/* Primary Cover Image (Media Library Only) */}
          <MediaSelectField
            label="Primary Project Cover Image"
            value={formData.coverImage}
            onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
            helperText="Main showcase visual (16:9 or 4:3 high-res recommended). Select from Centralized Media Library."
            aspectRatio="aspect-[16/10]"
            required
          />

          {/* Gallery Images (Media Library Only) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Gallery Screenshots & Case Study Variations
                </label>
                <p className="text-[11px] text-zinc-500">Add multiple visual slides from your Media Library.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setGalleryPickerOpen(true)}
                icon={Plus}
                className="cursor-pointer"
              >
                Choose from Media Library
              </Button>
            </div>

            {formData.galleryImages.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500 text-xs">
                No gallery screenshots added yet. Click "Choose from Media Library" to attach slides.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.galleryImages.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="relative group aspect-[16/10] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950"
                  >
                    <img src={imgUrl} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(i)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                      title="Remove from gallery"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Gallery Media Picker Modal */}
            <MediaPickerModal
              isOpen={galleryPickerOpen}
              onClose={() => setGalleryPickerOpen(false)}
              onSelect={(asset) => {
                const url = asset.fileUrl || asset.url;
                if (url && !formData.galleryImages.includes(url)) {
                  setFormData((prev) => ({
                    ...prev,
                    galleryImages: [...prev.galleryImages, url],
                  }));
                }
              }}
              title="Add to Project Gallery"
              subtitle="Select an asset from your Media Library to add as a gallery slide."
            />
          </div>
        </div>

        {/* Section 4: External Links & SEO */}
        <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">4. External Showcase Links & SEO Metadata</h3>
              <p className="text-xs text-zinc-400">Behance, Dribbble, Figma links and meta tags for search engines.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Behance Project URL
              </label>
              <input
                type="url"
                placeholder="https://behance.net/gallery/..."
                value={formData.behanceUrl || ''}
                onChange={(e) => setFormData({ ...formData, behanceUrl: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Dribbble Shot URL
              </label>
              <input
                type="url"
                placeholder="https://dribbble.com/shots/..."
                value={formData.dribbbleUrl || ''}
                onChange={(e) => setFormData({ ...formData, dribbbleUrl: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Figma File URL
              </label>
              <input
                type="url"
                placeholder="https://figma.com/file/..."
                value={formData.figmaUrl || ''}
                onChange={(e) => setFormData({ ...formData, figmaUrl: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Custom SEO Title Tag
              </label>
              <input
                type="text"
                placeholder="e.g. Brand Identity & Packaging Design | Md Sakhawat Hossain"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Image Alt Text
              </label>
              <input
                type="text"
                placeholder="e.g. High converting Facebook ad creative design showcase"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md sticky bottom-6 z-20">
          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            className="text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <Button
            variant="primary"
            icon={Save}
            loading={saving}
            type="submit"
            className="cursor-pointer"
          >
            {isNew ? 'Publish Showcase Project' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmSaveOpen}
        title={isNew ? 'Publish Project' : 'Save Project Changes'}
        message={`Are you sure you want to save "${formData.title}"?`}
        confirmLabel={isNew ? 'Publish Now' : 'Save Changes'}
        onConfirm={executeSaveProject}
        onCancel={() => setConfirmSaveOpen(false)}
        isLoading={saving}
      />
    </div>
  );
};

export default AdminProjectEditPage;
