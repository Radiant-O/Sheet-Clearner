import type { FileFormat } from '@/types';
import { ALLOWED_EXTENSIONS, EMPTY_VALUES, MAX_FILE_SIZE_BYTES } from './constants';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getFileExtension(filename: string): string {
  return ('.' + filename.split('.').pop()?.toLowerCase()) || '';
}

export function getFileFormat(file: File): FileFormat {
  const ext = getFileExtension(file.name);
  switch (ext) {
    case '.xlsx': return 'xlsx';
    case '.xls': return 'xls';
    case '.tsv': return 'tsv';
    default: return 'csv';
  }
}

export function isValidFileType(file: File): boolean {
  const ext = getFileExtension(file.name);
  return ALLOWED_EXTENSIONS.includes(ext);
}

export function isValidFileSize(file: File): boolean {
  return file.size > 0 && file.size <= MAX_FILE_SIZE_BYTES;
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  const strVal = String(value).trim();
  return EMPTY_VALUES.includes(strVal);
}

export function createDownloadFilename(prefix: string, format: FileFormat): string {
  return `${prefix}_${formatTimestamp()}.${format}`;
}

export function getMimeType(format: FileFormat): string {
  switch (format) {
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls': return 'application/vnd.ms-excel';
    case 'tsv': return 'text/tab-separated-values';
    case 'csv': default: return 'text/csv';
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
