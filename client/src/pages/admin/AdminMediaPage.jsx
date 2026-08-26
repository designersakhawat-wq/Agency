import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Trash2,
  Check,
  Search,
  ExternalLink,
  Edit2,
  FileText,
  Plus,
  RefreshCw,
  Info,
  Sparkles,
  Zap,
  Layers,
  HelpCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';

export const AdminMediaPage = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [altTextInput, setAltTextInput] = useState('');
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/media', { search });
      if (res.success) {
        setMediaItems(res.data?.items || res.data || []);
      }
    } catch (err) {
      showToast('Failed to load media: ' + (err.message || 'Error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const files = e.target?.files || e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const data = new FormData();

    if (files.length === 1) {
      data.append('file', files[0]);
      data.append('altText', files[0].name);
      try {
        const res = await api.upload('/admin/media/upload', data);
        if (res.success) {
          showToast('Asset uploaded successfully!', 'success');
          fetchMedia();
        } else {
          showToast(res.message || 'Upload failed', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Upload failed.', 'error');
      }
    } else {
      for (let i = 0; i < files.length; i++) {
        data.append('files', files[i]);
      }
      try {
        const res = await api.upload('/admin/media/upload-multiple', data);
        if (res.success) {
          showToast(`${files.length} assets uploaded successfully!`, 'success');
          fetchMedia();
        } else {
          showToast(res.message || 'Upload failed', 'error');
        }
      } catch (err) {
        showToast(err.message || 'Multiple upload failed.', 'error');
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploading(false);
  };

  const handleCopyUrl = (url, id) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    showToast('Asset URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleUpdateAltText = async (e) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      const res = await api.put(`/admin/media/${editTarget.id}`, { altText: altTextInput });
      if (res.success) {
        showToast('Alt text updated.', 'success');
        setEditTarget(null);
        fetchMedia();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await api.delete(`/admin/media/${deleteTarget.id}`);
      if (res.success) {
        showToast('Media deleted successfully.', 'success');
        setDeleteTarget(null);
        fetchMedia();
      }
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
        disabled={uploading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2.5">
            <span>Media Library</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono">
              Max 15MB/file
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Local & Cloudinary Storage Asset Manager. Upload high-res images and case study assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>{showGuidelines ? 'Hide Size Guide' : 'Size Recommendations'}</span>
          </button>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchMedia}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            isLoading={uploading}
            onClick={triggerFileInput}
            className="cursor-pointer"
          >
            Upload Assets
          </Button>
        </div>
      </div>

      {/* Recommended File Size & Resolution Guidelines */}
      {showGuidelines && (
        <div className="p-5 sm:p-6 rounded-2xl glass-card border border-teal-500/30 bg-gradient-to-r from-teal-950/20 via-zinc-900/60 to-zinc-950/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                📐 Recommended Media Upload Specifications (ফাইলের সাইজ ও রেজোলিউশন গাইডলাইন)
              </h3>
            </div>
            <span className="text-[11px] text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono">
              Fast 1s Page Load Optimization
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Spec 1: Portfolio Showcase */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">🖼️ Portfolio Cover & Hero</span>
                <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 px-1.5 py-0.2 rounded">16:9</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">1920 × 1080 px</p>
              <div className="text-[11px] text-zinc-400 space-y-0.5">
                <p>• সাইজ: <strong className="text-emerald-400">300 KB – 800 KB</strong></p>
                <p>• ফরম্যাট: <span className="text-zinc-200">WebP / JPG</span></p>
              </div>
            </div>

            {/* Spec 2: Social Media Ads */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">📱 Ad Creatives & Reels</span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.2 rounded">1:1 / 9:16</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">1080 × 1080 px / 1080 × 1920 px</p>
              <div className="text-[11px] text-zinc-400 space-y-0.5">
                <p>• সাইজ: <strong className="text-emerald-400">200 KB – 600 KB</strong></p>
                <p>• ফরম্যাট: <span className="text-zinc-200">PNG / WebP / JPG</span></p>
              </div>
            </div>

            {/* Spec 3: Brand Logos */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">🏢 Client Logos & Marks</span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded">Vector</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">400 × 120 px / 500 × 500 px</p>
              <div className="text-[11px] text-zinc-400 space-y-0.5">
                <p>• সাইজ: <strong className="text-emerald-400">Under 150 KB</strong></p>
                <p>• ফরম্যাট: <span className="text-zinc-200">Transparent PNG / SVG</span></p>
              </div>
            </div>

            {/* Spec 4: Avatar & Headshots */}
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">👤 Profile Avatar</span>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded">Square</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">800 × 800 px (1:1)</p>
              <div className="text-[11px] text-zinc-400 space-y-0.5">
                <p>• সাইজ: <strong className="text-emerald-400">Under 250 KB</strong></p>
                <p>• ফরম্যাট: <span className="text-zinc-200">WebP / PNG</span></p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 pt-1">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>টিপস:</strong> ছবি আপলোড করার আগে <span className="text-teal-300 font-mono">TinyPNG.com</span> অথবা <span className="text-teal-300 font-mono">Squoosh.app</span> থেকে কম্প্রেস করে নিলে সাইট দ্রুত লোড হবে এবং ছবি একদম ক্রিস্টাল ক্লিয়ার থাকবে।
            </span>
          </p>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl glass-card border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media files by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
          />
        </div>
        <span className="text-xs text-zinc-400">Total Items: {mediaItems.length}</span>
      </div>

      {/* Drag & Drop Dropzone / Grid */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e);
        }}
        className={`transition-all ${
          isDragging ? 'border-2 border-dashed border-teal-400 rounded-2xl bg-teal-500/5 p-6' : ''
        }`}
      >
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader message="Loading media items..." />
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-2xl border border-zinc-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <ImageIcon className="w-8 h-8 text-teal-400/80" />
            </div>
            <h3 className="text-base font-bold text-white">Media Library Empty</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Upload images to use across your portfolio case studies, brand logos, and site settings.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                icon={Upload}
                isLoading={uploading}
                onClick={triggerFileInput}
                className="cursor-pointer"
              >
                Upload First Asset
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl border border-zinc-800 overflow-hidden group flex flex-col justify-between"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-square bg-zinc-900 overflow-hidden flex items-center justify-center">
                  {item.fileType?.startsWith('image') ? (
                    <img
                      src={item.fileUrl}
                      alt={item.altText || item.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-zinc-500" />
                  )}

                  {/* Storage Source Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900/90 text-teal-300 border border-zinc-700">
                      {item.source || 'LOCAL'}
                    </span>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                      onClick={() => handleCopyUrl(item.fileUrl, item.id)}
                      className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-teal-600 transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => {
                        setEditTarget(item);
                        setAltTextInput(item.altText || '');
                      }}
                      className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                      title="Edit Alt Text"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 rounded-xl bg-zinc-800 text-rose-400 hover:bg-rose-950/80 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-3 border-t border-zinc-800 bg-zinc-950/40">
                  <p className="text-xs font-medium text-white truncate" title={item.fileName}>
                    {item.fileName}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-500">
                    <span className="font-mono">{Math.round((item.fileSize || 0) / 1024)} KB</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Alt Text Modal */}
      {editTarget && (
        <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Media Metadata">
          <form onSubmit={handleUpdateAltText} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">File Name</label>
              <input
                type="text"
                value={editTarget.fileName}
                disabled
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Alt Text (Accessibility & SEO)</label>
              <input
                type="text"
                value={altTextInput}
                onChange={(e) => setAltTextInput(e.target.value)}
                placeholder="Descriptive alt text..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Metadata
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete Media File"
          message={`Are you sure you want to permanently delete "${deleteTarget.fileName}"? This action cannot be undone.`}
          confirmLabel="Delete File"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminMediaPage;
