import { useState, useRef, useCallback } from 'react';
import { isValidFileType, isValidFileSize, formatFileSize } from '@/utils/helpers';
import { MAX_FILE_SIZE_BYTES } from '@/utils/constants';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export function FileDropzone({ onFileSelected, onError, disabled }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      if (!isValidFileType(file)) {
        onError('Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls, .tsv).');
        return;
      }
      if (file.size === 0) {
        onError('The uploaded file is empty.');
        return;
      }
      if (!isValidFileSize(file)) {
        onError(`File exceeds the maximum size of ${formatFileSize(MAX_FILE_SIZE_BYTES)}.`);
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected, onError]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [disabled, validateAndSelect]
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      tabIndex={0}
      role="button"
      aria-label="Upload file"
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 outline-none
        focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''}
        ${isDragging ? 'border-primary-500 bg-primary-50 scale-[1.01]' : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-primary-50/50'}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.tsv"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="flex flex-col items-center gap-4">
        <div className={`rounded-2xl p-4 transition-colors ${isDragging ? 'bg-primary-100' : 'bg-gray-100'}`}>
          <svg className={`w-10 h-10 transition-colors ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div>
          <p className="text-lg font-semibold text-gray-700">
            {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            or <span className="text-primary-600 font-medium hover:underline">browse files</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {['CSV', 'XLSX', 'XLS', 'TSV'].map((ext) => (
            <span key={ext} className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              .{ext.toLowerCase()}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-400">Maximum file size: 50MB</p>
      </div>
    </div>
  );
}
