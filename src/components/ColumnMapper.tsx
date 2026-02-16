import type { ColumnMapping, ColumnType } from '@/types';

interface ColumnMapperProps {
  headers: string[];
  mapping: ColumnMapping;
  detectedMapping: ColumnMapping;
  onUpdateMapping: (type: ColumnType, value: string | null) => void;
}

const columnTypeConfig: { type: ColumnType; label: string; icon: string; description: string }[] = [
  { type: 'email', label: 'Email', icon: '✉️', description: 'Email address column' },
  { type: 'phone', label: 'Phone', icon: '📱', description: 'Phone number column' },
  { type: 'name', label: 'Name', icon: '👤', description: 'Person/contact name column' },
  { type: 'domain', label: 'Domain', icon: '🌐', description: 'Website/domain column' },
];

export function ColumnMapper({ headers, mapping, detectedMapping, onUpdateMapping }: ColumnMapperProps) {
  const usedColumns = Object.values(mapping).filter(Boolean) as string[];

  return (
    <div className="animate-fade-in-up rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Column Mapping
        </h3>
        <p className="text-sm text-gray-500 mt-1">Map your spreadsheet columns to data types. Auto-detected columns are pre-selected.</p>
      </div>

      <div className="divide-y divide-gray-100">
        {columnTypeConfig.map(({ type, label, icon, description }) => {
          const isDetected = detectedMapping[type] !== null && mapping[type] === detectedMapping[type];
          const currentValue = mapping[type];

          return (
            <div key={type} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3 min-w-[140px]">
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-700 text-sm">{label}</p>
                  <p className="text-xs text-gray-400">{description}</p>
                </div>
              </div>

              <div className="flex-1">
                <select
                  value={currentValue || ''}
                  onChange={(e) => onUpdateMapping(type, e.target.value || null)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- Not Mapped --</option>
                  {headers.map((header) => (
                    <option
                      key={header}
                      value={header}
                      disabled={usedColumns.includes(header) && header !== currentValue}
                    >
                      {header} {usedColumns.includes(header) && header !== currentValue ? '(in use)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-[120px] text-right">
                {isDetected ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-success-600 bg-success-50 px-2.5 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Auto-detected
                  </span>
                ) : currentValue ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                    Manual
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                    Not set
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
