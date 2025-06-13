'use client';

import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Check, Circle, Lock } from 'lucide-react';
import type { WizardStepConfig } from '@/lib/wizard-config';

interface WizardMobileNavProps {
  steps: WizardStepConfig[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepChange: (stepIndex: number) => void;
  className?: string;
}

export function WizardMobileNav({
  steps,
  currentStep,
  completedSteps,
  onStepChange,
  className,
}: WizardMobileNavProps) {
  const getStepStatus = (index: number) => {
    if (completedSteps.has(index)) return 'completed';
    if (index === currentStep) return 'current';
    if (index < currentStep || [...completedSteps].some(step => step > index)) return 'available';
    return 'locked';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'current':
        return <Circle className="h-4 w-4 fill-current" />;
      case 'locked':
        return <Lock className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="navigation">
          <AccordionTrigger className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Navigation</span>
              <span className="text-muted-foreground">
                ({completedSteps.size}/{steps.length} completed)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <nav className="space-y-1 pt-2">
              {steps.map((step, index) => {
                const status = getStepStatus(index);
                const isAccessible = status !== 'locked';

                return (
                  <Button
                    key={step.id}
                    variant={status === 'current' ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      'w-full justify-start gap-2 text-left',
                      {
                        'bg-secondary': status === 'current',
                        'opacity-50': status === 'locked',
                      }
                    )}
                    onClick={() => isAccessible && onStepChange(index)}
                    disabled={!isAccessible}
                  >
                    {/* Step icon */}
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                        {
                          'bg-primary text-primary-foreground': status === 'completed' || status === 'current',
                          'bg-muted': status === 'available',
                          'bg-muted text-muted-foreground': status === 'locked',
                        }
                      )}
                    >
                      {getStepIcon(status)}
                    </div>

                    {/* Step title */}
                    <span className="flex-1 text-xs font-medium">
                      {step.title}
                    </span>

                    {step.isOptional && (
                      <span className="text-xs text-muted-foreground">Optional</span>
                    )}
                  </Button>
                );
              })}
            </nav>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
} 