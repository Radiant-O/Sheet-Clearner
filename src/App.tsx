import { useState, useCallback } from 'react';
import type { ColumnMapping, ColumnType, FileFormat, SheetInfo, ParsedData, AppStep } from '@/types';
import { formatFileSize, getFileFormat } from '@/utils/helpers';
import { useToast } from '@/hooks/useToast';
import { useFileParser } from '@/hooks/useFileParser';
import { ToastContainer } from '@/components/ToastContainer';
import { FileDropzone } from '@/components/FileDropzone';
import { FileInfoCard } from '@/components/FileInfoCard';
import { SheetSelectorModal } from '@/components/SheetSelectorModal';
import { ColumnMapper } from '@/components/ColumnMapper';
import { DataPreview } from '@/components/DataPreview';
import { ExtractPanel } from '@/components/ExtractPanel';
import { CleanPanel } from '@/components/CleanPanel';

export function App() {
  const { toasts, success, error, dismiss } = useToast();
  const { isParsing, parseError, parsedData, sheets, parseFile, getSheetList, reset: resetParser } = useFileParser();

  // State
  const [file, setFile] = useState<File | null>(null);
  const [originalFormat, setOriginalFormat] = useState<FileFormat>('csv');
  const [step, setStep] = useState<AppStep>('upload');
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [mapping, setMapping] = useState<ColumnMapping>({ email: null, phone: null, name: null, domain: null });
  const [detectedMapping, setDetectedMapping] = useState<ColumnMapping>({ email: null, phone: null, name: null, domain: null });
  const [activeTab, setActiveTab] = useState<'extract' | 'clean'>('extract');
  const [localParsedData, setLocalParsedData] = useState<ParsedData | null>(null);

  const handleFileSelected = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    const format = getFileFormat(selectedFile);
    setOriginalFormat(format);

    if (format === 'xlsx' || format === 'xls') {
      const sheetList = await getSheetList(selectedFile);
      if (sheetList.length > 1) {
        setShowSheetModal(true);
        setStep('select-sheet');
        return;
      }
    }

    // Parse directly
    const data = await parseFile(selectedFile);
    if (data) {
      setLocalParsedData(data);
      setMapping({ ...data.detectedMapping });
      setDetectedMapping({ ...data.detectedMapping });
      setStep('preview');
      success('File parsed successfully!');
    }
  }, [getSheetList, parseFile, success]);

  const handleSheetSelect = useCallback(async (sheet: SheetInfo) => {
    setShowSheetModal(false);
    if (!file) return;
    const data = await parseFile(file, sheet.name);
    if (data) {
      setLocalParsedData(data);
      setMapping({ ...data.detectedMapping });
      setDetectedMapping({ ...data.detectedMapping });
      setStep('preview');
      success(`Sheet "${sheet.name}" parsed successfully!`);
    }
  }, [file, parseFile, success]);

  const handleSheetModalClose = useCallback(() => {
    setShowSheetModal(false);
    if (step === 'select-sheet') {
      // Reset to upload
      setFile(null);
      setStep('upload');
      resetParser();
    }
  }, [step, resetParser]);

  const handleUpdateMapping = useCallback((type: ColumnType, value: string | null) => {
    setMapping((prev) => ({ ...prev, [type]: value }));
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setLocalParsedData(null);
    setMapping({ email: null, phone: null, name: null, domain: null });
    setDetectedMapping({ email: null, phone: null, name: null, domain: null });
    setStep('upload');
    resetParser();
  }, [resetParser]);

  const handleError = useCallback((msg: string) => {
    error(msg);
  }, [error]);

  // Show parseError as toast
  if (parseError && step !== 'upload') {
    error(parseError);
    handleRemoveFile();
  }

  const fileInfo = file
    ? {
        name: file.name,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        type: originalFormat,
        lastModified: file.lastModified,
      }
    : null;

  const data = localParsedData || parsedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <SheetSelectorModal
        open={showSheetModal}
        sheets={sheets}
        onSelect={handleSheetSelect}
        onClose={handleSheetModalClose}
      />

      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-200">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">Sheet Cleaner</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Clean & extract spreadsheet data</p>
              </div>
            </div>

            {step !== 'upload' && (
              <button
                onClick={handleRemoveFile}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New File
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Step */}
        {step === 'upload' && (
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Clean your spreadsheets
              </h2>
              <p className="text-gray-500 text-lg">
                Upload a CSV or Excel file to extract columns or remove incomplete rows.
              </p>
            </div>
            <FileDropzone onFileSelected={handleFileSelected} onError={handleError} />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
              {[
                { icon: '🔍', title: 'Auto-Detect', desc: 'Automatically identifies email, phone, name & domain columns' },
                { icon: '📤', title: 'Extract', desc: 'Export specific columns as CSV or TXT files' },
                { icon: '🧹', title: 'Clean', desc: 'Remove rows with missing emails or phone numbers' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="text-center p-5 rounded-xl bg-white border border-gray-100 shadow-sm">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-semibold text-gray-800 mt-2">{title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parsing State */}
        {(step === 'select-sheet' || isParsing) && !showSheetModal && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            {fileInfo && <FileInfoCard fileInfo={fileInfo} onRemove={handleRemoveFile} isParsing={isParsing} />}
            {isParsing && (
              <div className="text-center mt-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 mb-4">
                  <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
                <p className="text-gray-600 font-medium">Parsing your file...</p>
                <p className="text-sm text-gray-400 mt-1">This may take a moment for large files</p>
              </div>
            )}
          </div>
        )}

        {/* Preview & Process Step */}
        {step === 'preview' && data && fileInfo && (
          <div className="space-y-6 animate-fade-in">
            <FileInfoCard fileInfo={fileInfo} onRemove={handleRemoveFile} isParsing={false} />

            <ColumnMapper
              headers={data.headers}
              mapping={mapping}
              detectedMapping={detectedMapping}
              onUpdateMapping={handleUpdateMapping}
            />

            <DataPreview
              headers={data.headers}
              rows={data.rows}
              totalRows={data.totalRows}
              mapping={mapping}
            />

            {/* Mode Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('extract')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'extract'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  📤 Extract
                </span>
              </button>
              <button
                onClick={() => setActiveTab('clean')}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === 'clean'
                    ? 'bg-white text-success-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  🧹 Clean
                </span>
              </button>
            </div>

            {/* Active Panel */}
            <div>
              {activeTab === 'extract' && (
                <ExtractPanel
                  data={data.rows}
                  mapping={mapping}
                  onSuccess={success}
                  onError={handleError}
                />
              )}
              {activeTab === 'clean' && (
                <CleanPanel
                  data={data.rows}
                  mapping={mapping}
                  originalFormat={originalFormat}
                  onSuccess={success}
                  onError={handleError}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
            <p>Sheet Cleaner — Clean & extract spreadsheet data</p>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-success-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span>Your data is processed locally and never stored on any server</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
