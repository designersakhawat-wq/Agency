import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, X, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';

export const MediaSelectField = ({
  label,
  value,
  onChange,
  helperText,
  aspectRatio = 'aspect-video',
  placeholder = 'No image selected from Media Library',
  required = false,
  disabled = false,
  className = '',
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isPreviewZoomOpen, setIsPreviewZoomOpen] = useState(false);

  const handleSelect = (asset) => {
    if (onChange && asset) {
      onChange(asset.fileUrl || asset.url, asset);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange('', null);
    }
  };

  const hasValue = Boolean(value && String(value).trim());

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Label and Actions */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="text-[11px] text-zinc-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Remove Image
            </button>
          )}
        </div>
      )}

      {/* Main Visual Image Card */}
      <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3 flex flex-col sm:flex-row gap-4 items-center transition-all group hover:border-zinc-700">
        {/* Preview Frame */}
        <div
          className={`relative ${aspectRatio} w-full sm:w-44 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 flex items-center justify-center shrink-0 shadow-inner`}
        >
          {hasValue ? (
            <>
              <img
                src={value}
                alt={label || 'Media Asset'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder-cleaned.png';
                }}
              />
              <button
                type="button"
                onClick={() => setIsPreviewZoomOpen(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity backdrop-blur-xs"
                title="Zoom Preview"
              >
                <Eye className="w-5 h-5 drop-shadow" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
              <ImageIcon className="w-7 h-7 mb-1 stroke-1" />
              <span className="text-[11px]">No Media</span>
            </div>
          )}
        </div>

        {/* Info & Select Action */}
        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200 truncate">
                {hasValue ? value.split('/').pop().split('?')[0] : 'Media Library Selection'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
              {helperText ||
                (hasValue
                  ? 'Active asset selected from Centralized Media Library.'
                  : 'Select an existing image from your Media Library or upload a new asset.')}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              disabled={disabled}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 hover:border-indigo-500/50 shadow-sm transition-all cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              {hasValue ? 'Change Media Asset' : 'Choose from Media Library'}
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelect}
        title={label ? `Select ${label}` : 'Select Media Asset'}
        subtitle={`Select or upload an image to use for ${label || 'this section'}.`}
        currentValue={value}
      />

      {/* Zoom Preview Modal */}
      {isPreviewZoomOpen && hasValue && (
        <div
          onClick={() => setIsPreviewZoomOpen(false)}
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl">
            <img src={value} alt="Preview Zoom" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setIsPreviewZoomOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSelectField;
