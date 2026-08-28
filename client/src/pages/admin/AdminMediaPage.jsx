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
  AlertTriangle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';

export const AdminMediaPage = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [viewUsageTarget, setViewUsageTarget] = useState(null);
  const [altTextInput, setAltTextInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [isDragging, setIsDragging] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/media', { search }).catch(() => null);
      if (res && res.success && Array.isArray(res.data)) {
        setMediaItems(res.data);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleAutoScan = async () => {
    setScanning(true);
    try {
      const res = await api.post('/admin/media/scan', {});
      if (res && res.success) {
        showToast('Auto-scan complete! All website images synced into Media Library.', 'success');
        await fetchMedia();
      }
    } catch (err) {
      showToast('Scan failed to complete.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target?.files || e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      let uploadedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append('file', file);
        data.append('altText', file.name);

        const res = await api.upload('/admin/media/upload', data);
        if (res && res.success && res.data) {
          uploadedCount++;
        }
      }
      showToast(`${uploadedCount} asset(s) uploaded successfully!`, 'success');
      await fetchMedia();
    } catch (err) {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
        showToast(
          `Media deleted and globally unlinked from ${res.data?.unlinkedCount || 0} locations!`,
          'success'
        );
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

  const filteredItems = mediaItems.filter((item) => {
    if (filterType === 'USED') return (item.usageCount || 0) > 0;
    if (filterType === 'UNUSED') return (item.usageCount || 0) === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hidden File Input for Admin Media Library Upload */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={uploading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2.5">
            <span>Centralized Media Library</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono">
              Single Source of Truth
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            All images on your website are managed from here. Uploading or deleting an asset here updates all connected pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={scanning}
            onClick={handleAutoScan}
            title="Scan entire website, DB records, and server folders for existing images"
          >
            {scanning ? 'Scanning...' : 'Scan Website Images'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowGuidelines(!showGuidelines)}
          >
            <Info className="w-3.5 h-3.5 text-indigo-400 mr-1" />
            {showGuidelines ? 'Hide Guide' : 'Size Guide'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            isLoading={uploading}
            onClick={triggerFileInput}
            className="cursor-pointer bg-indigo-600 hover:bg-indigo-500"
          >
            Upload to Media Library
          </Button>
        </div>
      </div>

      {/* Size Guide Accordion */}
      {showGuidelines && (
        <div className="p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-zinc-900/60 to-zinc-950/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                📐 Recommended Media Upload Dimensions & Guidelines
              </h3>
            </div>
            <span className="text-[11px] text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-mono">
              Fast 1s Page Load Optimization
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">🖼️ Portfolio Cover</span>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">16:9</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">1920 × 1080 px (300-800 KB)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">📱 Ad Creatives & Reels</span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">1:1 / 9:16</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">1080 × 1080 px (200-600 KB)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">🏢 Client Logos</span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">PNG / SVG</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">400 × 120 px (&lt; 150 KB)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">👤 Profile Avatar</span>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">1:1</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">800 × 800 px (&lt; 250 KB)</p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl glass-card border border-zinc-800">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media files by name or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'ALL' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({mediaItems.length})
            </button>
            <button
              onClick={() => setFilterType('USED')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'USED' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Active in Site
            </button>
          </div>
        </div>
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
          isDragging ? 'border-2 border-dashed border-indigo-400 rounded-2xl bg-indigo-500/5 p-6' : ''
        }`}
      >
        {filteredItems.length === 0 && !loading ? (
          <div className="text-center py-24 glass-card rounded-2xl border border-zinc-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <ImageIcon className="w-8 h-8 text-indigo-400/80" />
            </div>
            <h3 className="text-base font-bold text-white">No Media Assets Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Scan existing website images or upload new assets to manage them centrally.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Button variant="primary" size="md" icon={Upload} onClick={triggerFileInput}>
                Upload Asset
              </Button>
              <Button variant="secondary" size="md" icon={RefreshCw} onClick={handleAutoScan}>
                Auto-Scan Website
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl border border-zinc-800 overflow-hidden group flex flex-col justify-between hover:border-zinc-700 transition-all"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-square bg-zinc-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.fileUrl}
                    alt={item.altText || item.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600';
                    }}
                  />

                  {/* Usage Badge (Bottom Left) */}
                  {(item.usageCount || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => setViewUsageTarget(item)}
                      className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-950/80 transition-colors cursor-pointer"
                      title="Click to view all locations where this image is used"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Used in {item.usageCount} {item.usageCount === 1 ? 'place' : 'places'}</span>
                    </button>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                      onClick={() => handleCopyUrl(item.fileUrl, item.id)}
                      className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-indigo-600 transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"
                      title="Open full size"
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
                      title="Delete & Global Unlink"
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
                    <span className="capitalize">{item.source || 'LOCAL'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Details Modal */}
      {viewUsageTarget && (
        <Modal
          isOpen={!!viewUsageTarget}
          onClose={() => setViewUsageTarget(null)}
          title="Media Asset Live Usage"
          subtitle={`Locations where "${viewUsageTarget.fileName}" is actively displayed on your website.`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <img
                src={viewUsageTarget.fileUrl}
                alt="Thumbnail"
                className="w-16 h-16 rounded-lg object-cover border border-zinc-700"
              />
              <div>
                <p className="text-sm font-semibold text-white">{viewUsageTarget.fileName}</p>
                <p className="text-xs text-zinc-400">{viewUsageTarget.fileUrl}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Connected References ({viewUsageTarget.usedIn?.length || 0}):
              </h4>
              {viewUsageTarget.usedIn && viewUsageTarget.usedIn.length > 0 ? (
                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
                  {viewUsageTarget.usedIn.map((u, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/40 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-indigo-400">[{u.module}]</span>{' '}
                        <span className="text-xs font-medium text-white">{u.title}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {u.field}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic p-3">This asset is not currently linked to any active page content.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setViewUsageTarget(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
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

      {/* Confirm Delete Dialog with Cascade Warning */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Delete & Global Cascade Unlink"
          message={
            (deleteTarget.usageCount || 0) > 0
              ? `⚠️ WARNING: "${deleteTarget.fileName}" is currently used in ${deleteTarget.usageCount} location(s) on your website. Deleting this asset will permanently remove the file and safely unlink it from all connected pages. Proceed?`
              : `Are you sure you want to permanently delete "${deleteTarget.fileName}" from the Media Library?`
          }
          confirmLabel="Delete Asset Globally"
          confirmVariant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminMediaPage;
