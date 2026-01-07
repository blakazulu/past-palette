import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-transparent p-4"
      onClick={handleBackdropClick}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-ancient-800 rounded-2xl p-6 max-w-sm mx-auto mt-[30vh] border border-ancient-600 shadow-xl">
        <h2 className="text-lg font-semibold text-ancient-100 mb-2">
          {title || t('gallery.deleteConfirm')}
        </h2>
        <p className="text-base text-ancient-400 mb-6">
          {message || t('gallery.deleteWarning')}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-ancient-600 text-ancient-200 font-medium hover:bg-ancient-700 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
          >
            {t('gallery.delete')}
          </button>
        </div>
      </div>
    </dialog>
  );
}
