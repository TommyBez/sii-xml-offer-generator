'use client';

import { lazy, Suspense, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { WizardStepConfig } from '@/lib/wizard-config';
import { formComponents, type FormComponentName } from '@/components/forms';

// Placeholder component for forms that haven't been implemented yet
const FormPlaceholder = ({ step, onSubmit }: { step: WizardStepConfig; onSubmit: (data: any) => void }) => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Form component "{step.component}" is not yet implemented.
          This is a placeholder for the {step.title} form.
        </AlertDescription>
      </Alert>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onSubmit({ placeholder: true })}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Continue (Placeholder)
        </button>
      </div>
    </div>
  );
};

interface WizardStepContentProps {
  step: WizardStepConfig;
  onSubmit: (data: any) => void;
}

export function WizardStepContent({ step, onSubmit }: WizardStepContentProps) {
  // Dynamically select the form component based on the step configuration
  const FormComponent = useMemo(() => {
    const componentName = step.component as FormComponentName;
    
    // Check if the component exists in our registry
    if (componentName in formComponents) {
      return formComponents[componentName];
    }
    
    // Fall back to placeholder for unimplemented forms
    return FormPlaceholder;
  }, [step.component]);

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>{step.title}</CardTitle>
        <CardDescription>{step.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          }
        >
          <FormComponent step={step} onSubmit={onSubmit} />
        </Suspense>
      </CardContent>
    </Card>
  );
} 