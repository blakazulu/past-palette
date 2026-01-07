import { useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getImageDimensions } from '@/lib/utils/image';

interface FileUploadProps {
  onFileSelect: (blob: Blob, width: number, height: number) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onFileSelect, onError }: FileUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError(t('errors.uploadFailed'));
      return;
    }

    try {
      const { width, height } = await getImageDimensions(file);
      onFileSelect(file, width, height);
    } catch (err) {
      console.error('File processing error:', err);
      onError(t('errors.uploadFailed'));
    }
  }, [onFileSelect, onError, t]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full max-w-md aspect-[3/4] rounded-2xl cursor-pointer
        flex flex-col items-center justify-center gap-6 p-8 transition-all duration-300
        ${isDragging
          ? 'glass-panel border-gold-400 scale-[1.02]'
          : 'glass-panel-dark hover:border-gold-500/30'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Animated border when dragging */}
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl border-2 border-gold-400 border-dashed animate-pulse" />
      )}

      {/* Icon */}
      <div className={`
        relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
        ${isDragging ? 'bg-gold-500/20 scale-110' : 'bg-obsidian-800/50'}
      `}>
        <UploadIcon className={`w-10 h-10 transition-colors ${isDragging ? 'text-gold-400' : 'text-obsidian-400'}`} />

        {/* Decorative sparkle */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold-500/40 animate-pulse" />
      </div>

      {/* Text content */}
      <div className="text-center">
        <p className={`text-lg font-display tracking-wide mb-2 transition-colors ${isDragging ? 'text-gold-300' : 'text-obsidian-200'}`}>
          {isDragging ? t('capture.dropHere') || 'Drop your image here' : t('capture.dragDrop')}
        </p>
        <p className="text-obsidian-500 text-sm mb-3">
          {t('capture.or')}
        </p>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/10 border border-gold-500/20 text-gold-400 text-sm font-display tracking-wider transition-all hover:bg-gold-500/20">
          <FolderIcon className="w-4 h-4" />
          {t('capture.selectFile')}
        </span>
      </div>

      {/* Supported formats */}
      <p className="text-xs text-obsidian-600 text-center">
        JPG, PNG, HEIC, WebP
      </p>

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-gold-500/20" />
      <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-gold-500/20" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-gold-500/20" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-gold-500/20" />
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
}
