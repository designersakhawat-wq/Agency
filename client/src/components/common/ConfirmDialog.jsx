import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, HelpCircle, Save, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText,
  confirmLabel,
  cancelText = 'Cancel',
  cancelLabel,
  isLoading = false,
  variant,
  confirmVariant,
  icon: CustomIcon,
}) => {
  const handleClose = onClose || onCancel || (() => {});
  const effectiveVariantProp = variant || confirmVariant;

  const isDanger =
    effectiveVariantProp === 'danger' ||
    (!effectiveVariantProp &&
      (title.toLowerCase().includes('delete') || title.toLowerCase().includes('remove')));
  const isWarning =
    effectiveVariantProp === 'warning' ||
    (!effectiveVariantProp && title.toLowerCase().includes('warn'));
  const effectiveVariant = isDanger ? 'danger' : isWarning ? 'warning' : 'primary';

  const defaultConfirmText = isDanger
    ? 'Yes, Delete'
    : effectiveVariant === 'warning'
    ? 'Yes, Proceed'
    : 'Yes, Save & Confirm';

  const finalConfirmText = confirmText || confirmLabel || defaultConfirmText;
  const finalCancelText = cancelText || cancelLabel || 'Cancel';

  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="w-6 h-6" />;
    if (effectiveVariant === 'danger') return <Trash2 className="w-6 h-6" />;
    if (effectiveVariant === 'warning') return <AlertTriangle className="w-6 h-6" />;
    return <Save className="w-6 h-6" />;
  };

  const getIconContainerStyle = () => {
    if (effectiveVariant === 'danger') return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
    if (effectiveVariant === 'warning') return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    return 'bg-teal-500/15 border-teal-500/30 text-teal-300';
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md" showClose={false}>
      <div className="p-2 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border shrink-0 ${getIconContainerStyle()}`}>
            {getIcon()}
          </div>
          <div className="space-y-1.5 flex-1">
            <h4 className="text-lg font-bold text-white font-display tracking-tight">{title}</h4>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="cursor-pointer"
          >
            {finalCancelText}
          </Button>
          <Button
            type="button"
            variant={effectiveVariant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            isLoading={isLoading}
            onClick={() => {
              if (onConfirm) onConfirm();
            }}
            className="cursor-pointer font-bold shadow-lg"
          >
            {finalConfirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
