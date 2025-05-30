import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ ...props }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2);
    const newToast = { id, ...props };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter(t => t.id !== id));
    }, props.duration || 3000);

    return {
      id,
      dismiss: () => setToasts((prev) => prev.filter(t => t.id !== id)),
    };
  }, []);

  const dismiss = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter(t => t.id !== toastId));
  }, []);

  return {
    toast,
    dismiss,
    toasts,
  };
}
