import type { Toast } from '@/types';

const icons: Record<Toast['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const styles: Record<Toast['type'], string> = {
  success: 'bg-success-50 border-success-500 text-success-600',
  error: 'bg-error-50 border-error-500 text-error-600',
  warning: 'bg-warning-50 border-warning-500 text-warning-600',
  info: 'bg-primary-50 border-primary-500 text-primary-600',
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-slide-in-right flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-lg backdrop-blur-sm ${styles[toast.type]}`}
        >
          <span className="text-lg font-bold flex-shrink-0 mt-0.5">{icons[toast.type]}</span>
          <p className="text-sm font-medium flex-1 leading-relaxed">{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 text-lg leading-none transition-opacity"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
