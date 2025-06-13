'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { WizardStepConfig } from '@/lib/wizard-config';

interface WizardProgressProps {
  steps: WizardStepConfig[];
  currentStep: number;
  completedSteps: Set<number>;
  className?: string;
}

export function WizardProgress({
  steps,
  currentStep,
  completedSteps,
  className,
}: WizardProgressProps) {
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps.size / totalSteps) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isAccessible = index <= currentStep || isCompleted;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
                style={{ flex: index === 0 || index === totalSteps - 1 ? '0' : '1' }}
              >
                {/* Circle indicator */}
                <div
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-all duration-200',
                    {
                      'border-primary bg-primary text-primary-foreground': isCurrent,
                      'border-primary bg-primary text-primary-foreground': isCompleted,
                      'border-muted-foreground': !isCompleted && !isCurrent && isAccessible,
                      'border-muted': !isAccessible,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className={cn('text-sm font-medium', {
                      'text-muted-foreground': !isAccessible && !isCurrent,
                    })}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Step title - only show on larger screens */}
                <div className="mt-2 hidden text-center md:block">
                  <p
                    className={cn('text-xs font-medium', {
                      'text-primary': isCurrent || isCompleted,
                      'text-muted-foreground': !isCurrent && !isCompleted,
                    })}
                  >
                    {step.title}
                  </p>
                  {step.isOptional && (
                    <p className="text-xs text-muted-foreground">(Optional)</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile step info */}
      <div className="mt-4 text-center md:hidden">
        <p className="text-sm font-medium">{steps[currentStep]?.title}</p>
        <p className="text-xs text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>

      {/* Progress text */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {completedSteps.size} of {totalSteps} steps completed ({Math.round(progressPercentage)}%)
        </p>
      </div>
    </div>
  );
} 