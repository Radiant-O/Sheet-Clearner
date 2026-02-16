import type { FileInfo } from '@/types';

interface FileInfoCardProps {
  fileInfo: FileInfo;
  onRemove: () => void;
  isParsing: boolean;
}

const formatIcons: Record<string, string> = {
  csv: '📄',
  xlsx: '📊',
  xls: '📊',
  tsv: '📄',
};

export function FileInfoCard({ fileInfo, onRemove, isParsing }: FileInfoCardProps) {
  return (
    <div className="animate-fade-in-up flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl">
        {formatIcons[fileInfo.type] || '📄'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-800 truncate">{fileInfo.name}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-sm text-gray-500">{fileInfo.sizeFormatted}</span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full uppercase font-medium">
            {fileInfo.type}
          </span>
        </div>
      </div>

      {isParsing ? (
        <div className="flex items-center gap-2 text-sm text-primary-600">
          <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="font-medium">Parsing...</span>
        </div>
      ) : (
        <button
          onClick={onRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
          title="Remove file"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Remove
        </button>
      )}
    </div>
  );
}
