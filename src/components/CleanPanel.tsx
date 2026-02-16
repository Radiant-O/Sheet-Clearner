import { useState, useMemo } from 'react';
import type { Row, ColumnMapping, CleanRule, FileFormat } from '@/types';
import { isEmpty } from '@/utils/helpers';
import { useFileExporter } from '@/hooks/useFileExporter';

interface CleanPanelProps {
  data: Row[];
  mapping: ColumnMapping;
  originalFormat: FileFormat;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const rules: { value: CleanRule; label: string; description: string; requiresEmail: boolean; requiresPhone: boolean }[] = [
  { value: 'email_required', label: 'Require Email', description: 'Remove rows with empty email', requiresEmail: true, requiresPhone: false },
  { value: 'phone_required', label: 'Require Phone', description: 'Remove rows with empty phone', requiresEmail: false, requiresPhone: true },
  { value: 'both_required', label: 'Require Both', description: 'Remove rows where email OR phone is empty', requiresEmail: true, requiresPhone: true },
  { value: 'either_required', label: 'Require Either', description: 'Remove rows where BOTH email AND phone are empty', requiresEmail: true, requiresPhone: true },
];

export function CleanPanel({ data, mapping, originalFormat, onSuccess, onError }: CleanPanelProps) {
  const [selectedRule, setSelectedRule] = useState<CleanRule | null>(null);
  const [format, setFormat] = useState<'original' | 'csv'>('csv');
  const { cleanAndExport } = useFileExporter();

  const emailMapped = mapping.email !== null;
  const phoneMapped = mapping.phone !== null;

  const preview = useMemo(() => {
    if (!selectedRule) return null;

    const emailCol = mapping.email;
    const phoneCol = mapping.phone;

    let keepCount = 0;
    for (const row of data) {
      const emailEmpty = emailCol ? isEmpty(row[emailCol]) : true;
      const phoneEmpty = phoneCol ? isEmpty(row[phoneCol]) : true;

      let keep = false;
      switch (selectedRule) {
        case 'email_required': keep = !emailEmpty; break;
        case 'phone_required': keep = !phoneEmpty; break;
        case 'both_required': keep = !emailEmpty && !phoneEmpty; break;
        case 'either_required': keep = !emailEmpty || !phoneEmpty; break;
      }
      if (keep) keepCount++;
    }

    return {
      keepCount,
      removeCount: data.length - keepCount,
      total: data.length,
    };
  }, [selectedRule, data, mapping]);

  const isRuleDisabled = (rule: typeof rules[0]): boolean => {
    if (rule.requiresEmail && rule.requiresPhone) return !emailMapped && !phoneMapped;
    if (rule.requiresEmail) return !emailMapped;
    if (rule.requiresPhone) return !phoneMapped;
    return false;
  };

  // For "either_required", we need at least one mapped
  const isRuleAvailable = (rule: typeof rules[0]): boolean => {
    if (rule.value === 'either_required') return emailMapped || phoneMapped;
    if (rule.value === 'both_required') return emailMapped && phoneMapped;
    return !isRuleDisabled(rule);
  };

  const handleClean = () => {
    if (!selectedRule) {
      onError('Please select a cleaning rule.');
      return;
    }
    try {
      const result = cleanAndExport(data, mapping, selectedRule, format, originalFormat);
      onSuccess(`Cleaned! Kept ${result.cleanedRowCount.toLocaleString()} rows, removed ${result.removedRowCount.toLocaleString()} rows.`);
    } catch {
      onError('Failed to clean data. Please try again.');
    }
  };

  const outputFormatLabel = originalFormat === 'xls' ? 'XLSX' : originalFormat.toUpperCase();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-success-50 to-white">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          Clean Data
        </h3>
        <p className="text-sm text-gray-500 mt-1">Remove rows with missing data and download the cleaned file.</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Rule Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Cleaning Rule</label>
          <div className="space-y-2">
            {rules.map((rule) => {
              const available = isRuleAvailable(rule);
              const isSelected = selectedRule === rule.value;

              return (
                <button
                  key={rule.value}
                  onClick={() => available && setSelectedRule(rule.value)}
                  disabled={!available}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    !available
                      ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50'
                      : isSelected
                      ? 'border-success-500 bg-success-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-success-300 hover:bg-success-50/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-success-500 border-success-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-700">{rule.label}</p>
                    <p className="text-xs text-gray-400">{rule.description}</p>
                  </div>
                  {!available && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Column not mapped
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="animate-fade-in rounded-xl bg-gray-50 border border-gray-200 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800">{preview.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Rows</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success-600">{preview.keepCount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">Rows Kept</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-error-500">{preview.removeCount.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">Rows Removed</p>
              </div>
            </div>
            <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-success-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(preview.keepCount / preview.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Output Format</label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormat('original')}
              className={`flex-1 px-4 py-3 rounded-xl border-2 text-center transition-all ${
                format === 'original'
                  ? 'border-success-500 bg-success-50 shadow-sm'
                  : 'border-gray-200 hover:border-success-300'
              }`}
            >
              <p className="font-bold text-sm text-gray-700">{outputFormatLabel}</p>
              <p className="text-xs text-gray-400 mt-0.5">Original format</p>
            </button>
            <button
              onClick={() => setFormat('csv')}
              className={`flex-1 px-4 py-3 rounded-xl border-2 text-center transition-all ${
                format === 'csv'
                  ? 'border-success-500 bg-success-50 shadow-sm'
                  : 'border-gray-200 hover:border-success-300'
              }`}
            >
              <p className="font-bold text-sm text-gray-700">CSV</p>
              <p className="text-xs text-gray-400 mt-0.5">Comma-separated</p>
            </button>
          </div>
        </div>

        {/* Clean Button */}
        <button
          onClick={handleClean}
          disabled={!selectedRule}
          className="w-full px-6 py-3.5 bg-success-600 hover:bg-success-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Clean & Download
          {preview && (
            <span className="ml-1 text-green-200">({preview.keepCount.toLocaleString()} rows)</span>
          )}
        </button>
      </div>
    </div>
  );
}
