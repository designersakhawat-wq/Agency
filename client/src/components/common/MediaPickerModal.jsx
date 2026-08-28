import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  X,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Layers,
  FileText,
  Plus,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import DataVault from '../../utils/dataVault';

export const MediaPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
  subtitle = 'Choose an image from your Centralized Media Library or upload a new one.',
  currentValue = '',
}) => {
  const [mediaItems, setMediaItems] = useState(() => DataVault.mergeMedia([]));
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

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
    if (isOpen) {
      fetchMedia();
      setSelectedAsset(null);
    }
  }, [isOpen]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => {
        fetchMedia();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [search]);

  const handleUpload = async (e) => {
    const files = e.target?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append('file', file);
        data.append('altText', file.name);

        const res = await api.upload('/admin/media/upload', data);
        if (res && res.success && res.data) {
          const newAsset = res.data;
          DataVault.saveMedia(newAsset);
          setMediaItems((prev) => [newAsset, ...(prev || []).filter((m) => m.id !== newAsset.id)]);
          setSelectedAsset(newAsset);
          showToast(`"${file.name}" uploaded to Media Library!`, 'success');
        }
      }
    } catch (err) {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAutoScan = async () => {
    setScanning(true);
    try {
      const res = await api.post('/admin/media/scan', {});
      if (res && res.success) {
        showToast('Auto-scan completed! All website images synced.', 'success');
        await fetchMedia();
      }
    } catch (err) {
      showToast('Scan failed to complete.', 'error');
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmSelect = () => {
    if (selectedAsset && onSelect) {
      onSelect(selectedAsset);
      onClose();
    }
  };

  const handleDirectSelect = (asset) => {
    setSelectedAsset(asset);
    if (onSelect) {
      onSelect(asset);
      onClose();
    }
  };

  const filteredItems = mediaItems.filter((item) => {
    if (filterType === 'USED') return (item.usageCount || 0) > 0;
    if (filterType === 'UNUSED') return (item.usageCount || 0) === 0;
    return true;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-[#121318] border border-zinc-700/80 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold text-white font-display">{title}</h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAutoScan}
                disabled={scanning}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition-colors"
                title="Scan all existing website folders and DB records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin text-indigo-400' : ''}`} />
                {scanning ? 'Scanning...' : 'Sync Inventory'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="p-4 border-b border-zinc-800 bg-zinc-950/40 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search media by filename or alt text..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-900/80 border border-zinc-700/60 rounded-xl text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'ALL'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All ({mediaItems.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('USED')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterType === 'USED'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Active in Site
              </button>
            </div>

            {/* Quick Upload Button (Direct into Media Library) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Upload className={`w-4 h-4 ${uploading ? 'animate-bounce' : ''}`} />
              {uploading ? 'Uploading...' : 'Upload New'}
            </button>
          </div>

          {/* Media Grid Content */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                <p className="text-sm">Loading Media Library assets...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-zinc-800 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-500 mx-auto mb-3">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h4 className="text-base font-semibold text-zinc-300">No media assets found</h4>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  {search
                    ? `No images match "${search}". Try another search term.`
                    : 'Click "Upload New" above or "Sync Inventory" to load images.'}
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload to Media Library
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoScan}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Auto-Scan Website
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {filteredItems.map((item) => {
                  const isSelected =
                    (selectedAsset && selectedAsset.id === item.id) ||
                    (currentValue && (currentValue === item.fileUrl || currentValue === item.url));

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAsset(item)}
                      onDoubleClick={() => handleDirectSelect(item)}
                      className={`group relative rounded-xl border p-2 flex flex-col transition-all cursor-pointer select-none bg-zinc-900/60 hover:bg-zinc-900 ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-500/5'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Image Thumbnail Container */}
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-950 flex items-center justify-center border border-zinc-800/50">
                        <img
                          src={item.fileUrl || item.url}
                          alt={item.altText || item.fileName}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/placeholder-cleaned.png';
                          }}
                        />

                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-150">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Usage Count Pill */}
                        {(item.usageCount || 0) > 0 && (
                          <div
                            className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
                            title={`Used in ${item.usageCount} location(s) across website`}
                          >
                            <Layers className="w-2.5 h-2.5" />
                            <span>{item.usageCount}</span>
                          </div>
                        )}
                      </div>

                      {/* File Metadata Info */}
                      <div className="mt-2 flex-1 flex flex-col justify-between">
                        <p
                          className="text-xs font-medium text-zinc-200 truncate group-hover:text-indigo-400 transition-colors"
                          title={item.fileName}
                        >
                          {item.fileName}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1">
                          <span>
                            {item.fileSize ? `${Math.round(item.fileSize / 1024)} KB` : 'Asset'}
                          </span>
                          <span className="capitalize">{item.source || 'Local'}</span>
                        </div>
                      </div>

                      {/* Hover Quick Select Overlay */}
                      <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Bar with Selection Confirmation */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-zinc-400 flex items-center gap-2">
              {selectedAsset ? (
                <>
                  <span className="text-zinc-200 font-semibold truncate max-w-xs">
                    {selectedAsset.fileName}
                  </span>
                  {(selectedAsset.usageCount || 0) > 0 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Used in {selectedAsset.usageCount} place(s)
                    </span>
                  )}
                </>
              ) : (
                <span>Click an image to select it, or double-click to choose immediately.</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSelect}
                disabled={!selectedAsset}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all ${
                  selectedAsset
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                Select Media
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MediaPickerModal;
