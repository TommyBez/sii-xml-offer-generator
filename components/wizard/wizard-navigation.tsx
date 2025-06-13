'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isLastStep: boolean;
  className?: string;
  isSubmitting?: boolean;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  isLastStep,
  className,
  isSubmitting = false,
}: WizardNavigationProps) {
  return (
    <div className={cn('bg-background', className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Previous button */}
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoBack || isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Center - Step indicator for mobile */}
          <div className="text-sm text-muted-foreground md:hidden">
            Step {currentStep + 1} of {totalSteps}
          </div>

          {/* Right side - Next/Submit button */}
          <div className="flex gap-2">
            {isLastStep ? (
              <Button
                type="submit"
                onClick={onNext}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Complete & Review
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={onNext}
                disabled={!canGoForward || isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Additional navigation hints */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground sm:gap-4">
          <span>Alt + ← / → to navigate</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Ctrl/Cmd + S to save</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Tab to move between fields</span>
        </div>
      </div>
    </div>
  );
} 