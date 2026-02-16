import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type { ParsedData, Row, SheetInfo, FileFormat } from '@/types';
import { useColumnDetector } from './useColumnDetector';
import { getFileFormat } from '@/utils/helpers';

export function useFileParser() {
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const { detect } = useColumnDetector();

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const getSheetList = useCallback(async (file: File): Promise<SheetInfo[]> => {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', bookSheets: true });
      const sheetInfos = workbook.SheetNames.map((name, index) => ({ name, index }));
      setSheets(sheetInfos);
      return sheetInfos;
    } catch {
      setParseError('Unable to read Excel file. It may be corrupted or password-protected.');
      return [];
    }
  }, []);

  const parseCSV = useCallback(async (file: File): Promise<ParsedData | null> => {
    try {
      const text = await readFileAsText(file);
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
      });

      if (result.errors.length > 0 && result.data.length === 0) {
        setParseError('Unable to parse CSV file. Please check the format.');
        return null;
      }

      const headers = result.meta.fields || [];
      const rows = result.data as Row[];

      if (headers.length === 0) {
        setParseError('Could not detect column headers.');
        return null;
      }
      if (rows.length === 0) {
        setParseError('The file contains no data rows.');
        return null;
      }

      const detectedMapping = detect(headers);
      const data: ParsedData = { headers, rows, totalRows: rows.length, detectedMapping };
      setParsedData(data);
      return data;
    } catch {
      setParseError('Unable to parse file. It may be corrupted.');
      return null;
    }
  }, [detect]);

  const parseExcel = useCallback(async (file: File, sheetName?: string): Promise<ParsedData | null> => {
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });

      const selectedSheet = sheetName || workbook.SheetNames[0];
      if (!workbook.SheetNames.includes(selectedSheet)) {
        setParseError(`Sheet "${selectedSheet}" not found.`);
        return null;
      }

      const worksheet = workbook.Sheets[selectedSheet];
      const jsonData = XLSX.utils.sheet_to_json<Row>(worksheet, { defval: '' });

      if (jsonData.length === 0) {
        setParseError('The selected sheet contains no data rows.');
        return null;
      }

      const headers = Object.keys(jsonData[0]);
      if (headers.length === 0) {
        setParseError('Could not detect column headers.');
        return null;
      }

      const detectedMapping = detect(headers);
      const data: ParsedData = { headers, rows: jsonData, totalRows: jsonData.length, detectedMapping };
      setParsedData(data);
      return data;
    } catch {
      setParseError('Unable to parse Excel file. It may be corrupted or password-protected.');
      return null;
    }
  }, [detect]);

  const parseFile = useCallback(async (file: File, sheetName?: string): Promise<ParsedData | null> => {
    setIsParsing(true);
    setParseError(null);
    setParsedData(null);

    try {
      const format: FileFormat = getFileFormat(file);
      if (format === 'csv' || format === 'tsv') {
        return await parseCSV(file);
      } else {
        return await parseExcel(file, sheetName);
      }
    } finally {
      setIsParsing(false);
    }
  }, [parseCSV, parseExcel]);

  const reset = useCallback(() => {
    setParsedData(null);
    setParseError(null);
    setSheets([]);
    setIsParsing(false);
  }, []);

  return { isParsing, parseError, parsedData, sheets, parseFile, getSheetList, reset };
}
