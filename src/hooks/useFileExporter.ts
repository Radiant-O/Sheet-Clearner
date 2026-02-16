import { useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { Row, FileFormat, ColumnMapping, CleanRule } from '@/types';
import { isEmpty, createDownloadFilename, downloadBlob } from '@/utils/helpers';

export function useFileExporter() {
  const exportCSV = useCallback((data: Row[], filename?: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename || createDownloadFilename('export', 'csv'));
  }, []);

  const exportTXT = useCallback((values: string[], filename?: string) => {
    const content = values.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    downloadBlob(blob, filename || createDownloadFilename('export', 'csv').replace('.csv', '.txt'));
  }, []);

  const exportXLSX = useCallback((data: Row[], filename?: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    downloadBlob(blob, filename || createDownloadFilename('export', 'xlsx'));
  }, []);

  const extractColumns = useCallback(
    (data: Row[], mapping: Partial<ColumnMapping>, selectedTypes: string[], format: 'csv' | 'txt') => {
      const columnEntries = selectedTypes
        .map((type) => {
          const colName = mapping[type as keyof ColumnMapping];
          return colName ? { type, colName } : null;
        })
        .filter(Boolean) as { type: string; colName: string }[];

      if (columnEntries.length === 0) return;

      if (format === 'txt' && columnEntries.length === 1) {
        const colName = columnEntries[0].colName;
        const values = data.map((row) => String(row[colName] ?? '')).filter((v) => v.trim() !== '');
        const filename = createDownloadFilename(`extract_${columnEntries[0].type}`, 'csv').replace('.csv', '.txt');
        exportTXT(values, filename);
      } else if (format === 'txt') {
        const headers = columnEntries.map((e) => e.type);
        const lines = [headers.join('\t')];
        for (const row of data) {
          const vals = columnEntries.map((e) => String(row[e.colName] ?? ''));
          lines.push(vals.join('\t'));
        }
        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        downloadBlob(blob, createDownloadFilename('extract', 'csv').replace('.csv', '.txt'));
      } else {
        const extracted = data.map((row) => {
          const newRow: Row = {};
          for (const entry of columnEntries) {
            newRow[entry.type] = row[entry.colName];
          }
          return newRow;
        });
        exportCSV(extracted, createDownloadFilename('extract', 'csv'));
      }
    },
    [exportCSV, exportTXT]
  );

  const cleanAndExport = useCallback(
    (
      data: Row[],
      mapping: ColumnMapping,
      rule: CleanRule,
      format: 'original' | 'csv',
      originalFormat: FileFormat
    ) => {
      const emailCol = mapping.email;
      const phoneCol = mapping.phone;

      const cleaned = data.filter((row) => {
        const emailEmpty = emailCol ? isEmpty(row[emailCol]) : true;
        const phoneEmpty = phoneCol ? isEmpty(row[phoneCol]) : true;

        switch (rule) {
          case 'email_required':
            return !emailEmpty;
          case 'phone_required':
            return !phoneEmpty;
          case 'both_required':
            return !emailEmpty && !phoneEmpty;
          case 'either_required':
            return !emailEmpty || !phoneEmpty;
          default:
            return true;
        }
      });

      const filename = createDownloadFilename('cleaned', format === 'original' ? (originalFormat === 'xls' ? 'xlsx' : originalFormat) : 'csv');

      if (format === 'csv' || originalFormat === 'csv' || originalFormat === 'tsv') {
        exportCSV(cleaned, filename);
      } else {
        exportXLSX(cleaned, filename);
      }

      return {
        originalRowCount: data.length,
        cleanedRowCount: cleaned.length,
        removedRowCount: data.length - cleaned.length,
      };
    },
    [exportCSV, exportXLSX]
  );

  return { exportCSV, exportTXT, exportXLSX, extractColumns, cleanAndExport };
}
