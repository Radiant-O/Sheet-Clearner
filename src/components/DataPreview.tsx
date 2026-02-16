import { useMemo } from 'react';
import type { Row, ColumnMapping } from '@/types';
import { isEmpty } from '@/utils/helpers';
import { MAX_PREVIEW_ROWS } from '@/utils/constants';

interface DataPreviewProps {
  headers: string[];
  rows: Row[];
  totalRows: number;
  mapping: ColumnMapping;
}

export function DataPreview({ headers, rows, totalRows, mapping }: DataPreviewProps) {
  const previewRows = rows.slice(0, MAX_PREVIEW_ROWS);
  const mappedColumns = new Set(Object.values(mapping).filter(Boolean));

  const stats = useMemo(() => {
    const emailCol = mapping.email;
    const phoneCol = mapping.phone;
    let emailCount = 0;
    let phoneCount = 0;

    for (const row of rows) {
      if (emailCol && !isEmpty(row[emailCol])) emailCount++;
      if (phoneCol && !isEmpty(row[phoneCol])) phoneCount++;
    }

    return {
      totalRows,
      totalColumns: headers.length,
      emailCount,
      phoneCount,
      emptyEmailCount: emailCol ? totalRows - emailCount : totalRows,
      emptyPhoneCount: phoneCol ? totalRows - phoneCount : totalRows,
    };
  }, [rows, totalRows, headers.length, mapping]);

  return (
    <div className="animate-fade-in-up space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Rows" value={stats.totalRows.toLocaleString()} icon="📊" />
        <StatCard label="Columns" value={stats.totalColumns.toString()} icon="📋" />
        <StatCard
          label="With Email"
          value={mapping.email ? `${stats.emailCount.toLocaleString()}` : 'N/A'}
          sub={mapping.email ? `${Math.round((stats.emailCount / totalRows) * 100)}%` : undefined}
          icon="✉️"
          variant={mapping.email && stats.emailCount > 0 ? 'success' : 'default'}
        />
        <StatCard
          label="With Phone"
          value={mapping.phone ? `${stats.phoneCount.toLocaleString()}` : 'N/A'}
          sub={mapping.phone ? `${Math.round((stats.phoneCount / totalRows) * 100)}%` : undefined}
          icon="📱"
          variant={mapping.phone && stats.phoneCount > 0 ? 'success' : 'default'}
        />
        <StatCard
          label="Empty Email"
          value={mapping.email ? stats.emptyEmailCount.toLocaleString() : 'N/A'}
          icon="⚠️"
          variant={mapping.email && stats.emptyEmailCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          label="Empty Phone"
          value={mapping.phone ? stats.emptyPhoneCount.toLocaleString() : 'N/A'}
          icon="⚠️"
          variant={mapping.phone && stats.emptyPhoneCount > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Data Preview
          </h3>
          <span className="text-xs text-gray-500">
            Showing {previewRows.length} of {totalRows.toLocaleString()} rows
          </span>
        </div>

        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12 border-b border-gray-200">
                  #
                </th>
                {headers.map((header) => (
                  <th
                    key={header}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap border-b border-gray-200 ${
                      mappedColumns.has(header) ? 'text-primary-600 bg-primary-50/50' : 'text-gray-500'
                    }`}
                  >
                    {header}
                    {mappedColumns.has(header) && (
                      <span className="ml-1.5 text-[10px] font-bold text-primary-500">●</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {previewRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">{i + 1}</td>
                  {headers.map((header) => (
                    <td
                      key={header}
                      className={`px-4 py-2.5 whitespace-nowrap max-w-[240px] truncate ${
                        mappedColumns.has(header) ? 'bg-primary-50/30 font-medium text-gray-800' : 'text-gray-600'
                      } ${isEmpty(row[header]) ? 'text-gray-300 italic' : ''}`}
                      title={String(row[header] ?? '')}
                    >
                      {isEmpty(row[header]) ? '(empty)' : String(row[header])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalRows > MAX_PREVIEW_ROWS && (
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 text-center text-sm text-gray-500">
            ... and {(totalRows - MAX_PREVIEW_ROWS).toLocaleString()} more rows
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, variant = 'default' }: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
  variant?: 'default' | 'success' | 'warning';
}) {
  const bgColor = variant === 'success' ? 'bg-success-50 border-success-200' : variant === 'warning' ? 'bg-warning-50 border-warning-200' : 'bg-white border-gray-200';

  return (
    <div className={`rounded-xl border p-3 ${bgColor}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-gray-800">{value}</span>
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
      </div>
    </div>
  );
}
