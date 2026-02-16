import { useState, useCallback, useRef, useEffect } from 'react';
import type { Toast } from '@/types';
import { DEFAULT_TOAST_DURATION } from '@/utils/constants';
import { generateId } from '@/utils/helpers';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (type: Toast['type'], message: string, duration = DEFAULT_TOAST_DURATION) => {
      const id = generateId();
      const toast: Toast = { id, type, message, duration };
      setToasts((prev) => [...prev.slice(-4), toast]);
      const timer = setTimeout(() => dismiss(id), duration);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  const success = useCallback((msg: string, dur?: number) => addToast('success', msg, dur), [addToast]);
  const error = useCallback((msg: string, dur?: number) => addToast('error', msg, dur ?? 7000), [addToast]);
  const warning = useCallback((msg: string, dur?: number) => addToast('warning', msg, dur), [addToast]);
  const info = useCallback((msg: string, dur?: number) => addToast('info', msg, dur), [addToast]);

  const dismissAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  return { toasts, success, error, warning, info, dismiss, dismissAll };
}
