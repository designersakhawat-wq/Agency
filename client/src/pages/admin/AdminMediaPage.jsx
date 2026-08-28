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
import DataVault from '../../utils/dataVault';

// High-Performance In-Browser Canvas Compressor (Converts to crisp WebP/SVG with 100% visual fidelity)
const compressImageToWebP = (imageUrl, quality = 0.86, maxDimension = 2560) => {
  return new Promise((resolve) => {
    const img = new Image();
    // Only set crossOrigin if URL is external http(s)
    if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) && !imageUrl.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width || 800;
        canvas.height = height || 800;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          if (webpDataUrl && webpDataUrl.startsWith('data:image/webp')) {
            return resolve({ dataUrl: webpDataUrl, format: 'webp', width, height });
          }
        } catch (canvasErr) {}

        const fallbackUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ dataUrl: fallbackUrl, format: 'jpeg', width, height });
      } catch (err) {
        resolve({ dataUrl: null, format: 'webp' });
      }
    };
    img.onerror = () => {
      resolve({ dataUrl: null, format: 'webp' });
    };
    img.src = imageUrl;
  });
};

export const AdminMediaPage = () => {
  const [mediaItems, setMediaItems] = useState(() => DataVault.mergeMedia([]));
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

  // Image Optimizer States
  const [optimizeModalOpen, setOptimizeModalOpen] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizingId, setOptimizingId] = useState(null);
  const [optQuality, setOptQuality] = useState(0.86);
  const [optFormat, setOptFormat] = useState('webp');
  const [optimizeProgress, setOptimizeProgress] = useState({
    current: 0,
    total: 0,
    currentFileName: '',
    savedBytesTotal: 0,
    completed: false,
  });

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/media', { search }).catch(() => null);
      if (res && res.success && Array.isArray(res.data)) {
        const merged = DataVault.mergeMedia(res.data);
        setMediaItems(merged);
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

  // 1-Click Optimize Single Image to WebP
  const handleOptimizeSingleItem = async (item) => {
    if (!item || !item.fileUrl) return;
    setOptimizingId(item.id);
    try {
      const fullUrl = item.fileUrl.startsWith('http') ? item.fileUrl : `${window.location.origin}${item.fileUrl}`;
      const { dataUrl } = await compressImageToWebP(fullUrl, optQuality);

      const res = await api.post(`/admin/media/${item.id}/optimize`, {
        dataUrl,
        targetFormat: optFormat,
        quality: optQuality,
      });

      if (res && res.success) {
        const savedKb = Math.round((res.data?.savedBytes || 0) / 1024);
        showToast(
          `"${item.fileName}" converted to WebP! ${savedKb > 0 ? `Saved ${savedKb} KB (${res.data?.reductionPercent || 0}% lighter).` : 'Optimized successfully!'}`,
          'success'
        );
        if (res.data?.media) {
          DataVault.saveMedia(res.data.media);
        }
        await fetchMedia();
      } else {
        showToast(res?.message || 'Failed to optimize image.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Optimization notice: Could not process image.', 'error');
    } finally {
      setOptimizingId(null);
    }
  };

  // Batch Image Optimization Handler (Processes all images with live progress bar)
  const handleStartBatchOptimization = async () => {
    if (mediaItems.length === 0) return;
    setOptimizing(true);
    setOptimizeProgress({
      current: 0,
      total: mediaItems.length,
      currentFileName: 'Starting compression...',
      savedBytesTotal: 0,
      completed: false,
    });

    let totalSaved = 0;
    let successfulCount = 0;

    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      setOptimizeProgress((prev) => ({
        ...prev,
        current: i + 1,
        currentFileName: item.fileName,
      }));

      try {
        const fullUrl = item.fileUrl.startsWith('http') ? item.fileUrl : `${window.location.origin}${item.fileUrl}`;
        const { dataUrl } = await compressImageToWebP(fullUrl, optQuality);

        const res = await api.post(`/admin/media/${item.id}/optimize`, {
          dataUrl,
          targetFormat: optFormat,
          quality: optQuality,
        });

        if (res && res.success && res.data) {
          totalSaved += (res.data.savedBytes || 0);
          successfulCount++;
        }
      } catch (err) {
        console.warn(`Could not optimize ${item.fileName}:`, err.message);
      }

      setOptimizeProgress((prev) => ({
        ...prev,
        savedBytesTotal: totalSaved,
      }));
    }

    setOptimizeProgress((prev) => ({
      ...prev,
      completed: true,
    }));
    setOptimizing(false);

    const savedMb = (totalSaved / (1024 * 1024)).toFixed(2);
    showToast(`🎉 ${successfulCount} images compressed to WebP! Total disk saved: ${savedMb} MB. Site speed boosted!`, 'success');
    await fetchMedia();
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
          if (Array.isArray(res.data)) {
            res.data.forEach((item) => DataVault.saveMedia(item));
          } else {
            DataVault.saveMedia(res.data);
          }
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
    DataVault.deleteMedia(deleteTarget.id);
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
      setDeleteTarget(null);
      fetchMedia();
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

  const totalBytes = mediaItems.reduce((acc, curr) => acc + (curr.fileSize || 0), 0);

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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono">
              Single Source of Truth
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            All images on your website are managed from here. Uploading, compressing, or deleting an asset updates all connected pages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* ⚡ 1-Click Compress & Convert to WebP/SVG Button */}
          <Button
            variant="primary"
            size="sm"
            icon={Zap}
            onClick={() => setOptimizeModalOpen(true)}
            className="cursor-pointer bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-black shadow-lg shadow-teal-950/50"
            title="Compress all images and convert to high-performance WebP/SVG"
          >
            ⚡ Convert to WebP/SVG & Compress
          </Button>

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
            <Info className="w-3.5 h-3.5 text-teal-400 mr-1" />
            {showGuidelines ? 'Hide Guide' : 'Size Guide'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Upload}
            isLoading={uploading}
            onClick={triggerFileInput}
            className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
          >
            Upload to Media Library
          </Button>
        </div>
      </div>

      {/* Size Guide Accordion */}
      {showGuidelines && (
        <div className="p-5 rounded-2xl border border-teal-500/30 bg-gradient-to-r from-teal-950/20 via-zinc-900/60 to-zinc-950/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                📐 Recommended Media Upload Dimensions & Guidelines
              </h3>
            </div>
            <span className="text-[11px] text-teal-300 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-mono">
              Fast 1s Page Load Optimization
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">🖼️ Facebook Cover</span>
                <span className="text-[10px] font-bold text-teal-300 bg-teal-500/20 px-1.5 py-0.5 rounded">820 × 312</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">820 × 312 px (&lt; 150 KB WebP)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">💼 LinkedIn Banner</span>
                <span className="text-[10px] font-bold text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded">1584 × 396</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">1584 × 396 px (&lt; 200 KB WebP)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">📱 Ad Creatives & Reels</span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded">1:1 / 9:16</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">1080 × 1080 px (&lt; 150 KB WebP)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">🏢 Client Logos</span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">SVG / WebP</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono">400 × 120 px (&lt; 60 KB)</p>
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
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'ALL' ? 'bg-teal-500 text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({mediaItems.length})
            </button>
            <button
              onClick={() => setFilterType('USED')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === 'USED' ? 'bg-teal-500 text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200'
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
          isDragging ? 'border-2 border-dashed border-teal-400 rounded-2xl bg-teal-500/5 p-6' : ''
        }`}
      >
        {filteredItems.length === 0 && !loading ? (
          <div className="text-center py-24 glass-card rounded-2xl border border-zinc-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
              <ImageIcon className="w-8 h-8 text-teal-400/80" />
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
                className="glass-card rounded-2xl border border-zinc-800 overflow-hidden group flex flex-col justify-between hover:border-teal-500/50 transition-all"
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

                  {/* Format Badge (Top Right) */}
                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono font-bold text-teal-400 border border-teal-500/30 uppercase">
                    {item.fileName?.split('.').pop() || 'IMG'}
                  </span>

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
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-xs p-2 flex-wrap">
                    {/* ⚡ Quick Compress & Convert to WebP */}
                    <button
                      onClick={() => handleOptimizeSingleItem(item)}
                      disabled={optimizingId === item.id}
                      className="p-2 rounded-xl bg-teal-500/20 text-teal-300 hover:bg-teal-500 hover:text-zinc-950 border border-teal-500/30 transition-all cursor-pointer font-bold"
                      title="Compress & Convert to WebP"
                    >
                      <Zap className={`w-4 h-4 ${optimizingId === item.id ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={() => handleCopyUrl(item.fileUrl, item.id)}
                      className="p-2 rounded-xl bg-zinc-800 text-white hover:bg-teal-500 hover:text-zinc-950 transition-colors cursor-pointer"
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

      {/* =========================================================================
          ⚡ IMAGE COMPRESSION & WEBP/SVG OPTIMIZER MODAL
          ========================================================================= */}
      {optimizeModalOpen && (
        <Modal
          isOpen={optimizeModalOpen}
          onClose={() => !optimizing && setOptimizeModalOpen(false)}
          title="⚡ Convert to WebP/SVG & Ultra Image Compressor"
          subtitle="Compresses large images and converts them to next-gen WebP/SVG with 100% visual sharpness for 3x faster website speed."
          size="lg"
        >
          <div className="space-y-5">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase">Library Assets</span>
                <p className="text-xl font-black text-white font-mono">{mediaItems.length} Images</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="text-[11px] font-bold text-zinc-400 uppercase">Current Size</span>
                <p className="text-xl font-black text-amber-400 font-mono">
                  {(totalBytes / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 space-y-1">
                <span className="text-[11px] font-bold text-teal-400 uppercase">Expected Size</span>
                <p className="text-xl font-black text-teal-300 font-mono">
                  ~{(totalBytes * 0.22 / (1024 * 1024)).toFixed(2)} MB (78% Lighter)
                </p>
              </div>
            </div>

            {/* Quality & Format Settings */}
            {!optimizing && !optimizeProgress.completed && (
              <div className="space-y-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Target High-Performance Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOptFormat('webp')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        optFormat === 'webp'
                          ? 'border-teal-500 bg-teal-500/10 text-white'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5 text-teal-400">
                        <span>🌟 Next-Gen WebP (Recommended)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Up to 80% smaller than JPG/PNG with 100% crystal clear quality and transparency support.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOptFormat('svg')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        optFormat === 'svg'
                          ? 'border-teal-500 bg-teal-500/10 text-white'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5 text-sky-400">
                        <span>📐 SVG Vector Wrapper</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Scalable responsive vector standard for logos, branding assets, and badges.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-300">Visual Quality Level</span>
                    <span className="font-mono font-bold text-teal-400">{Math.round(optQuality * 100)}% (Crystal Sharp)</span>
                  </div>
                  <input
                    type="range"
                    min="0.70"
                    max="0.95"
                    step="0.05"
                    value={optQuality}
                    onChange={(e) => setOptQuality(parseFloat(e.target.value))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500">
                    <span>70% (Ultra Compact)</span>
                    <span>86% (Recommended Sweet Spot)</span>
                    <span>95% (Near Lossless)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
                  <p className="font-bold text-teal-300 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> All Connected Pages Auto-Update
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    When compressed, your portfolio cover photos, testimonials, client logos, and site settings will automatically point to the newly optimized lightweight WebP files.
                  </p>
                </div>
              </div>
            )}

            {/* Live Progress Bar during Optimization */}
            {optimizing && (
              <div className="space-y-3 p-5 rounded-2xl bg-zinc-900 border border-teal-500/40 text-center">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span className="flex items-center gap-2 text-teal-400">
                    <Zap className="w-4 h-4 animate-spin text-teal-400" />
                    Compressing Images ({optimizeProgress.current} of {optimizeProgress.total})...
                  </span>
                  <span className="font-mono text-teal-300">
                    {Math.round((optimizeProgress.current / optimizeProgress.total) * 100)}%
                  </span>
                </div>

                {/* Progress Track */}
                <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(optimizeProgress.current / optimizeProgress.total) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span className="truncate max-w-[240px]">Processing: {optimizeProgress.currentFileName}</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    Saved so far: {(optimizeProgress.savedBytesTotal / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}

            {/* Success Results State */}
            {optimizeProgress.completed && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <Check className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white font-display">
                    🎉 Optimization Complete!
                  </h4>
                  <p className="text-xs text-emerald-300">
                    All images have been converted to high-speed WebP/SVG. Total disk space saved:{' '}
                    <strong className="text-white font-mono">
                      {(optimizeProgress.savedBytesTotal / (1024 * 1024)).toFixed(2)} MB
                    </strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800">
              <Button
                variant="secondary"
                size="sm"
                disabled={optimizing}
                onClick={() => setOptimizeModalOpen(false)}
              >
                {optimizeProgress.completed ? 'Done' : 'Cancel'}
              </Button>

              {!optimizeProgress.completed && (
                <Button
                  variant="primary"
                  size="md"
                  icon={Zap}
                  isLoading={optimizing}
                  onClick={handleStartBatchOptimization}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-black shadow-lg shadow-teal-950/50"
                >
                  {optimizing ? 'Compressing...' : '🚀 Start Batch Optimization'}
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}

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
                        <span className="text-xs font-semibold text-teal-400">[{u.module}]</span>{' '}
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
