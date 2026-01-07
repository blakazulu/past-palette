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
        w-full max-w-md aspect-[3/4] rounded-2xl border-2 border-dashed cursor-pointer
        flex flex-col items-center justify-center gap-4 p-6 transition-colors
        ${isDragging
          ? 'border-gold-400 bg-gold-400/10'
          : 'border-ancient-600 hover:border-ancient-500 bg-ancient-800/50'
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

      <div className="w-16 h-16 rounded-full bg-ancient-700 flex items-center justify-center">
        <UploadIcon className="w-8 h-8 text-ancient-300" />
      </div>

      <div className="text-center">
        <p className="text-ancient-200 font-medium mb-1">
          {t('capture.dragDrop')}
        </p>
        <p className="text-ancient-500 text-sm">
          {t('capture.or')}
        </p>
        <p className="text-gold-400 text-sm mt-1">
          {t('capture.selectFile')}
        </p>
      </div>
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
