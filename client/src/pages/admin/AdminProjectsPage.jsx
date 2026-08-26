import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  FolderKanban,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Sparkles,
  Layers,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Eye,
  Star,
  Globe,
  Tag,
  Calendar,
  User,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CATEGORY_OPTIONS = [
  'Social Media & Ads',
  'Logo & Brand Identity',
  'Product Packaging',
  'Banner & Hero Web Ads',
  'UI/UX Design',
  'UGC Video / Motion',
  'E-Commerce Creatives',
  'Print & Marketing',
];

export const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  // Form State for Create / Edit Modal
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    slug: '',
    category: 'Social Media & Ads',
    client: '',
    year: new Date().getFullYear().toString(),
    summary: '',
    description: '',
    coverImage: '',
    galleryImages: [],
    liveUrl: '',
    githubUrl: '',
    figmaUrl: '',
    behanceUrl: '',
    dribbbleUrl: '',
    featured: false,
    order: 0,
    tags: ['Ad Creative', 'Branding', 'Figma'],
    challenges: '',
    solutions: '',
    results: '',
    active: true,
  });

  const [tagInput, setTagInput] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects/admin/all');
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      showToast('Error loading projects: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchParams.get('create') === 'true' || searchParams.get('new') === 'true') {
      openCreateModal();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setFormData({
      id: null,
      title: '',
      slug: '',
      category: 'Social Media & Ads',
      client: '',
      year: new Date().getFullYear().toString(),
      summary: '',
      description: '',
      coverImage: '',
      galleryImages: [],
      liveUrl: '',
      githubUrl: '',
      figmaUrl: '',
      behanceUrl: '',
      dribbbleUrl: '',
      featured: false,
      order: 0,
      tags: ['Social Media', 'Creative Design'],
      challenges: '',
      solutions: '',
      results: '',
      active: true,
    });
    setTagInput('');
    setEditorOpen(true);
  };

  const openEditModal = (proj) => {
    let parsedTags = proj.tags;
    if (typeof parsedTags === 'string') {
      try {
        parsedTags = JSON.parse(parsedTags);
      } catch (e) {
        parsedTags = parsedTags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }
    let parsedGallery = proj.galleryImages;
    if (typeof parsedGallery === 'string') {
      try {
        parsedGallery = JSON.parse(parsedGallery);
      } catch (e) {
        parsedGallery = [];
      }
    }

    setFormData({
      id: proj.id,
      title: proj.title || '',
      slug: proj.slug || '',
      category: proj.category || 'Social Media & Ads',
      client: proj.client || '',
      year: proj.year || new Date().getFullYear().toString(),
      summary: proj.summary || '',
      description: proj.description || '',
      coverImage: proj.coverImage || '',
      galleryImages: Array.isArray(parsedGallery) ? parsedGallery : [],
      liveUrl: proj.liveUrl || '',
      githubUrl: proj.githubUrl || '',
      figmaUrl: proj.figmaUrl || '',
      behanceUrl: proj.behanceUrl || '',
      dribbbleUrl: proj.dribbbleUrl || '',
      featured: Boolean(proj.featured),
      order: Number(proj.order) || 0,
      tags: Array.isArray(parsedTags) ? parsedTags : [],
      challenges: proj.challenges || '',
      solutions: proj.solutions || '',
      results: proj.results || '',
      active: proj.active !== false,
    });
    setTagInput('');
    setEditorOpen(true);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !prev.id ? generateSlug(val) : prev.slug,
    }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const data = new FormData();
    data.append('file', file);
    data.append('altText', formData.title || 'Project Cover Image');
    try {
      const res = await api.upload('/admin/media/upload', data);
      if (res.success && res.data?.fileUrl) {
        setFormData((prev) => ({ ...prev, coverImage: res.data.fileUrl }));
        showToast('Cover image uploaded successfully!', 'success');
      }
    } catch (err) {
      showToast('Image upload failed: ' + err.message, 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (!tagInput.trim()) return;
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSavePrompt = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.coverImage) {
      showToast('Title, Category, and Cover Image are required.', 'error');
      return;
    }
    setConfirmSaveOpen(true);
  };

  const executeSaveProject = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: JSON.stringify(formData.tags),
        galleryImages: JSON.stringify(formData.galleryImages),
      };

      let res;
      if (formData.id) {
        res = await api.put(`/projects/admin/${formData.id}`, payload);
      } else {
        res = await api.post('/projects/admin', payload);
      }

      if (res.success) {
        showToast(formData.id ? 'Project updated successfully!' : 'Project created successfully!', 'success');
        setEditorOpen(false);
        setConfirmSaveOpen(false);
        fetchProjects();
      } else {
        showToast(res.message || 'Failed to save project.', 'error');
      }
    } catch (err) {
      showToast('Error saving project: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/projects/admin/${deleteTarget.id}`);
      if (res.success) {
        showToast('Project deleted successfully.', 'success');
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        showToast(res.message || 'Failed to delete project.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete project.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = projects.filter((p) => {
    return (
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Hidden Upload Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Portfolio Projects</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage showcase case studies, live links, and featured works.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          icon={Plus}
          onClick={openCreateModal}
          className="cursor-pointer font-bold shadow-lg"
        >
          Add New Project
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl glass-card border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, category, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
          />
        </div>
        <span className="text-xs text-zinc-400 font-mono">Total: {filtered.length} Projects</span>
      </div>

      {/* Table / List */}
      {loading ? (
        <Loader message="Loading portfolio items..." fullScreen />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-zinc-800 space-y-3">
          <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Projects Found</h3>
          <p className="text-xs text-zinc-400">Create your first portfolio project to showcase on your website.</p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={openCreateModal}
            className="cursor-pointer"
          >
            Add First Project
          </Button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold font-mono text-[11px]">
                <tr>
                  <th className="p-4">Project</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Client / Year</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filtered.map((proj) => (
                  <tr key={proj.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={proj.coverImage}
                          alt={proj.title}
                          className="w-14 h-10 rounded-lg object-cover bg-zinc-800 shrink-0 border border-zinc-700"
                        />
                        <div>
                          <span className="font-bold text-white text-sm block">{proj.title}</span>
                          <span className="text-[11px] text-zinc-500 font-mono">/{proj.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <Badge variant="teal" size="sm">
                        {proj.category}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <span className="font-medium text-white block">{proj.client || '—'}</span>
                      <span className="text-[11px] text-zinc-500">{proj.year || '2025'}</span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {proj.featured && (
                          <Badge variant="amber" size="sm" dot>
                            Featured
                          </Badge>
                        )}
                        <Badge variant={proj.active ? 'emerald' : 'default'} size="sm">
                          {proj.active ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/portfolio/${proj.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors inline-flex items-center justify-center cursor-pointer"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(proj)}
                          className="p-2 rounded-lg bg-teal-500/15 text-teal-300 hover:bg-teal-500 hover:text-white transition-colors inline-flex items-center justify-center cursor-pointer shadow"
                          title="Edit Project"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(proj)}
                          className="p-2 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors inline-flex items-center justify-center cursor-pointer shadow"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL INSTANT PROJECT EDITOR MODAL */}
      <Modal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={formData.id ? `Edit Project: ${formData.title}` : 'Create New Portfolio Project'}
        size="xl"
      >
        <form onSubmit={handleSavePrompt} className="space-y-6 max-h-[78vh] overflow-y-auto pr-1">
          {/* Section 1: Basic Info */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">1. Core Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-zinc-300 font-semibold block mb-1">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. ORA Organic E-Commerce Ad Creatives"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-300 font-semibold block mb-1">URL Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  placeholder="e.g. ora-organic-ad-creatives"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-zinc-300 font-semibold block mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-300 font-semibold block mb-1">Client Name</label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="e.g. ORA Organic (Dubai)"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-300 font-semibold block mb-1">Year</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2025"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-300 font-semibold block mb-1">Summary / Tagline *</label>
              <input
                type="text"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="High-impact visual advertising campaign delivering 4.8x ROAS"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
                required
              />
            </div>
          </div>

          {/* Section 2: Cover Image & Media */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">2. Cover Image & Visuals</h4>
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-300 font-semibold block">Cover Image URL *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="e.g. /uploads/project.jpg or https://..."
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                  required
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  isLoading={uploadingCover}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer shrink-0"
                >
                  Upload File
                </Button>
              </div>

              {formData.coverImage && (
                <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3 mt-2">
                  <img
                    src={formData.coverImage}
                    alt="Preview"
                    className="w-20 h-14 object-cover rounded-lg border border-zinc-700"
                  />
                  <div className="text-[11px] text-emerald-400 font-mono">Cover Thumbnail Active</div>
                </div>
              )}
            </div>

            {/* External Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Live Case Study / Web URL</label>
                <input
                  type="text"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Figma / Design URL</label>
                <input
                  type="text"
                  value={formData.figmaUrl}
                  onChange={(e) => setFormData({ ...formData, figmaUrl: e.target.value })}
                  placeholder="https://figma.com/..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tags & Toggles */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">3. Tags & Visibility</h4>
            
            {/* Tags Manager */}
            <div>
              <label className="text-[11px] text-zinc-300 font-semibold block mb-1.5">Project Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag and press Enter..."
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-teal-400"
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                  Add Tag
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {formData.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-mono"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700 accent-amber-500"
                />
                <span className="text-xs font-bold text-white">⭐ Featured on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 bg-zinc-950 border-zinc-700 accent-emerald-500"
                />
                <span className="text-xs font-bold text-white">🟢 Published (Live)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={saving}>
              {formData.id ? 'Save Project Changes' : 'Create & Publish Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Save Modal */}
      <ConfirmDialog
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={executeSaveProject}
        title={formData.id ? 'Save Project Changes?' : 'Create & Publish Project?'}
        message={`Are you sure you want to save "${formData.title}"?`}
        confirmText="Yes, Save Project"
        cancelText="Review Again"
        isLoading={saving}
        variant="primary"
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Portfolio Project"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete Project"
        cancelText="Cancel"
        isLoading={deleteLoading}
        variant="danger"
      />
    </div>
  );
};

export default AdminProjectsPage;
