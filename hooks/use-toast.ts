import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  const toast = ({ title, description, variant = 'default', duration }: ToastOptions) => {
    const message = title || description || '';
    const descriptionText = title && description ? description : undefined;

    if (variant === 'destructive') {
      sonnerToast.error(message, {
        description: descriptionText,
        duration,
      });
    } else {
      sonnerToast(message, {
        description: descriptionText,
        duration,
      });
    }
  };

  return { toast };
} 