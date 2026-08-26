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
} from 'lucide-react';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';

const categories = [
  'UI/UX Design',
  'Web Development',
  'Brand Identity',
  'Mobile App',
  'Design System',
  'SaaS Platform',
];

const AdminProjectEditPage = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'UI/UX Design',
    client: '',
    year: new Date().getFullYear().toString(),
    summary: '',
    description: '',
    coverImage: '',
    galleryImages: [],
    liveUrl: '',
    githubUrl: '',
    figmaUrl: '',
    featured: false,
    order: 0,
    tags: ['Figma', 'UI/UX', 'React'],
    challenges: '',
    solutions: '',
    results: '',
    active: true,
  });

  const [tagInput, setTagInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (!isNew) {
      const fetchProject = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/projects/admin/all`);
          if (res.success) {
            const found = res.data.find((p) => p.id === id);
            if (found) {
              let parsedTags = found.tags;
              if (typeof parsedTags === 'string') {
                try {
                  parsedTags = JSON.parse(parsedTags);
                } catch (e) {
                  parsedTags = [];
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
                tags: Array.isArray(parsedTags) ? parsedTags : [],
                galleryImages: Array.isArray(parsedGallery) ? parsedGallery : [],
              });
            } else {
              error('Project not found.');
              navigate('/admin/projects');
            }
          }
        } catch (err) {
          error('Error loading project: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id, isNew, navigate]);

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
    data.append('altText', formData.title || 'Project Cover');

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

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

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

  if (loading) {
    return <Loader message="Loading project editor..." fullScreen />;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
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
            isLoading={saving}
          >
            {isNew ? 'Publish Project' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form id="project-form" onSubmit={handleSubmit} className="space-y-8">
        {/* Core Metadata Card */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            1. Core Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                placeholder="e.g. FinFlow — Next-Gen AI Fintech Platform"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                URL Slug (Optional - Auto-generated)
              </label>
              <input
                type="text"
                placeholder="finflow-ai-fintech"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c, idx) => (
                  <option key={idx} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Client / Brand Name
              </label>
              <input
                type="text"
                placeholder="e.g. FinFlow Inc."
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Project Year
              </label>
              <input
                type="text"
                placeholder="2025"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Short Summary / Teaser *
            </label>
            <textarea
              rows={2}
              placeholder="A brief 1-2 sentence overview shown in grid cards and SEO meta..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Comprehensive Case Study Description *
            </label>
            <textarea
              rows={6}
              placeholder="Detailed explanation of the product narrative, UX decisions, research methodology, design tokens..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Media & Gallery */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            2. Visuals & Media
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Cover Image URL *
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="https://images.unsplash.com/... or /uploads/..."
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                required
              />
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors">
                <Upload className="w-4 h-4" />
                <span>{uploadingCover ? 'Uploading...' : 'Upload File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingCover}
                />
              </label>
            </div>

            <p className="text-[11px] text-teal-400 mt-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>রিসাইজ রিকমেন্ডেশন: <strong>1920 × 1080 px (16:9)</strong> • সাইজ: <strong className="text-emerald-400">300 KB – 800 KB</strong> (WebP/JPG) দ্রুত পেজ লোডিংয়ের জন্য</span>
            </p>

            {formData.coverImage && (
              <div className="mt-3 w-48 aspect-[16/10] rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900">
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Gallery Images List */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Gallery Images / Additional Screenshots
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add Image URL..."
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGalleryImage())}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <Button variant="secondary" size="sm" onClick={handleAddGalleryImage} icon={Plus}>
                Add Image
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.galleryImages.map((imgUrl, i) => (
                <div
                  key={i}
                  className="relative group aspect-[16/10] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900"
                >
                  <img src={imgUrl} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(i)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Links & External Integrations */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            3. Project Links & Tags
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                Live Demo URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Figma className="w-3.5 h-3.5 text-purple-400" />
                Figma Source URL
              </label>
              <input
                type="url"
                placeholder="https://figma.com/..."
                value={formData.figmaUrl}
                onChange={(e) => setFormData({ ...formData, figmaUrl: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-zinc-400" />
                GitHub Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Skills & Tech Stack Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Type tag (e.g. Design Tokens, Tailwind, Next.js) and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <Button variant="secondary" size="sm" onClick={handleAddTag} icon={Plus}>
                Add Tag
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs border border-zinc-700"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-zinc-500 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Case Study Challenges & Outcomes */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            4. Challenge, Solution & Impact Metrics
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              The Challenge / Friction Point
            </label>
            <textarea
              rows={2}
              placeholder="What hurdles was the client facing? (e.g. complex onboarding, low checkout conversions)"
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              The Solution & Architectural Approach
            </label>
            <textarea
              rows={2}
              placeholder="How did you solve the problem? (e.g. tokenized component library, simplified 1-step checkout)"
              value={formData.solutions}
              onChange={(e) => setFormData({ ...formData, solutions: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              The Results / Business Impact
            </label>
            <textarea
              rows={2}
              placeholder="Key measurable statistics (e.g. +68% conversion increase, $18M Series A closed)"
              value={formData.results}
              onChange={(e) => setFormData({ ...formData, results: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Publishing & Visibility Settings */}
        <div className="p-6 sm:p-8 rounded-2xl glass-card border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-4 w-full sm:w-auto">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-zinc-900 border-zinc-700"
              />
              <span className="text-xs font-bold text-white">Feature on Homepage Highlight</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 bg-zinc-900 border-zinc-700"
              />
              <span className="text-xs font-bold text-white">Active / Published</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/projects')}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              isLoading={saving}
            >
              {isNew ? 'Create Project' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={executeSaveProject}
        title={isNew ? 'Publish New Case Study?' : 'Save Case Study Changes?'}
        message={`Are you sure you want to ${isNew ? 'create and publish' : 'save updates to'} "${formData.title || 'this project'}"?`}
        confirmText={isNew ? 'Yes, Publish Project' : 'Yes, Save Changes'}
        cancelText="Review Again"
        isLoading={saving}
        variant="primary"
      />
    </div>
  );
};

export default AdminProjectEditPage;
