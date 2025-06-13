import { useEffect } from 'react';

interface UseKeyboardNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onSave,
  canGoNext = true,
  canGoPrevious = true,
  enabled = true,
}: UseKeyboardNavigationProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Navigate with arrow keys when holding Alt/Option
      if (event.altKey) {
        switch (event.key) {
          case 'ArrowRight':
            event.preventDefault();
            if (canGoNext && onNext) {
              onNext();
            }
            break;
          case 'ArrowLeft':
            event.preventDefault();
            if (canGoPrevious && onPrevious) {
              onPrevious();
            }
            break;
        }
      }

      // Save with Ctrl/Cmd + S
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (onSave) {
          onSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, canGoNext, canGoPrevious, onNext, onPrevious, onSave]);
} 