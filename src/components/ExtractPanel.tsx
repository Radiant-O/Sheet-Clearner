import { useState, useMemo } from 'react';
import type { Row, ColumnMapping } from '@/types';
import { useFileExporter } from '@/hooks/useFileExporter';

interface ExtractPanelProps {
  data: Row[];
  mapping: ColumnMapping;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const columnTypes = [
  { type: 'email' as const, label: 'Email', icon: '✉️' },
  { type: 'phone' as const, label: 'Phone', icon: '📱' },
  { type: 'name' as const, label: 'Name', icon: '👤' },
  { type: 'domain' as const, label: 'Domain', icon: '🌐' },
];

export function ExtractPanel({ data, mapping, onSuccess, onError }: ExtractPanelProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [format, setFormat] = useState<'csv' | 'txt'>('csv');
  const { extractColumns } = useFileExporter();

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const extractableCount = useMemo(() => {
    return selectedTypes.filter((t) => mapping[t as keyof ColumnMapping]).length;
  }, [selectedTypes, mapping]);

  const handleExtract = () => {
    if (extractableCount === 0) {
      onError('Please select at least one mapped column to extract.');
      return;
    }
    try {
      const cols: Partial<ColumnMapping> = {};
      for (const type of selectedTypes) {
        const key = type as keyof ColumnMapping;
        if (mapping[key]) {
          cols[key] = mapping[key];
        }
      }
      extractColumns(data, cols, selectedTypes.filter((t) => mapping[t as keyof ColumnMapping]), format);
      onSuccess(`Successfully extracted ${extractableCount} column(s) as ${format.toUpperCase()}.`);
    } catch {
      onError('Failed to extract data. Please try again.');
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-white">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Extract Columns
        </h3>
        <p className="text-sm text-gray-500 mt-1">Select columns to extract and download as a new file.</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Column Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Select Columns</label>
          <div className="grid grid-cols-2 gap-2">
            {columnTypes.map(({ type, label, icon }) => {
              const isMapped = mapping[type] !== null;
              const isSelected = selectedTypes.includes(type);

              return (
                <button
                  key={type}
                  onClick={() => isMapped && toggleType(type)}
                  disabled={!isMapped}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    !isMapped
                      ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50'
                      : isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {isMapped ? mapping[type] : 'Not mapped'}
                    </p>
                  </div>
                  {isMapped && (
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Output Format</label>
          <div className="flex gap-3">
            {(['csv', 'txt'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`flex-1 px-4 py-3 rounded-xl border-2 text-center transition-all ${
                  format === fmt
                    ? 'border-primary-500 bg-primary-50 shadow-sm'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <p className="font-bold text-sm text-gray-700 uppercase">{fmt}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {fmt === 'csv' ? 'Comma-separated values' : 'Plain text (one per line)'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Extract Button */}
        <button
          onClick={handleExtract}
          disabled={extractableCount === 0}
          className="w-full px-6 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Extract & Download
          {extractableCount > 0 && (
            <span className="ml-1 text-primary-200">({extractableCount} column{extractableCount > 1 ? 's' : ''})</span>
          )}
        </button>
      </div>
    </div>
  );
}
