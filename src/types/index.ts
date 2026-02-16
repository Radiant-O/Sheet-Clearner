export type FileFormat = 'csv' | 'xlsx' | 'xls' | 'tsv';

export interface FileInfo {
  name: string;
  size: number;
  sizeFormatted: string;
  type: FileFormat;
  lastModified: number;
}

export interface SheetInfo {
  name: string;
  index: number;
}

export type Row = Record<string, CellValue>;
export type CellValue = string | number | boolean | null | undefined;

export type ColumnType = 'email' | 'phone' | 'name' | 'domain';

export interface ColumnMapping {
  email: string | null;
  phone: string | null;
  name: string | null;
  domain: string | null;
}

export interface DetectionResult {
  column: string | null;
  confidence: 'high' | 'medium' | 'none';
}

export type ColumnDetectionMap = {
  [K in ColumnType]: DetectionResult;
};

export interface ParsedData {
  headers: string[];
  rows: Row[];
  totalRows: number;
  detectedMapping: ColumnMapping;
}

export interface DataStatistics {
  totalRows: number;
  totalColumns: number;
  emailCount: number;
  phoneCount: number;
  emptyEmailCount: number;
  emptyPhoneCount: number;
}

export type CleanRule =
  | 'email_required'
  | 'phone_required'
  | 'both_required'
  | 'either_required';

export type AppStep = 'upload' | 'select-sheet' | 'preview' | 'process';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
}
