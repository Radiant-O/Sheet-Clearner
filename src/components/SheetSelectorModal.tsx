import { useEffect, useRef } from 'react';
import type { SheetInfo } from '@/types';

interface SheetSelectorModalProps {
  open: boolean;
  sheets: SheetInfo[];
  onSelect: (sheet: SheetInfo) => void;
  onClose: () => void;
}

export function SheetSelectorModal({ open, sheets, onSelect, onClose }: SheetSelectorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div ref={modalRef} className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Select Sheet</h2>
            <p className="text-sm text-gray-500 mt-0.5">This workbook contains multiple sheets</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 max-h-80 overflow-y-auto">
          <div className="space-y-1.5">
            {sheets.map((sheet) => (
              <button
                key={sheet.index}
                onClick={() => onSelect(sheet)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-primary-50 transition-colors group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-4.5 h-4.5 text-gray-500 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700 group-hover:text-primary-700 transition-colors">
                  {sheet.name}
                </span>
                <svg className="w-4 h-4 ml-auto text-gray-300 group-hover:text-primary-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
