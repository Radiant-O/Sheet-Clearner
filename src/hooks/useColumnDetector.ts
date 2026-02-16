import { useCallback } from 'react';
import type { ColumnMapping, ColumnType } from '@/types';
import { COLUMN_TYPE_PATTERNS } from '@/utils/constants';

export function useColumnDetector() {
  const detect = useCallback((headers: string[]): ColumnMapping => {
    const mapping: ColumnMapping = { email: null, phone: null, name: null, domain: null };
    const used = new Set<string>();

    const types: ColumnType[] = ['email', 'phone', 'name', 'domain'];

    // First pass: exact matches
    for (const type of types) {
      const patterns = COLUMN_TYPE_PATTERNS[type];
      for (const header of headers) {
        if (used.has(header)) continue;
        const normalized = header.toLowerCase().trim();
        if (patterns.exact.includes(normalized)) {
          // Check excludes for name type
          if (type === 'name' && 'exclude' in patterns) {
            const excludes = (patterns as typeof COLUMN_TYPE_PATTERNS.name).exclude;
            if (excludes.some((ex) => normalized.includes(ex))) continue;
          }
          mapping[type] = header;
          used.add(header);
          break;
        }
      }
    }

    // Second pass: partial matches for unmapped types
    for (const type of types) {
      if (mapping[type] !== null) continue;
      const patterns = COLUMN_TYPE_PATTERNS[type];
      for (const header of headers) {
        if (used.has(header)) continue;
        const normalized = header.toLowerCase().trim();
        if (type === 'name' && 'exclude' in patterns) {
          const excludes = (patterns as typeof COLUMN_TYPE_PATTERNS.name).exclude;
          if (excludes.some((ex) => normalized.includes(ex))) continue;
        }
        if (patterns.partial.some((p) => normalized.includes(p))) {
          mapping[type] = header;
          used.add(header);
          break;
        }
      }
    }

    return mapping;
  }, []);

  return { detect };
}
