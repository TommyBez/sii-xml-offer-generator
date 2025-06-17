'use client';

import { lazy, Suspense, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { WizardStepConfig } from '@/lib/wizard-config';
import { formComponents, type FormComponentName } from '@/components/forms';
import { useWizardStore } from '@/store/wizard-store';

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
  const formData = useWizardStore((state) => state.formData);
  
  // Map step IDs to form data keys
  const stepToFormDataKey: Record<string, string> = {
    'identification': 'identification',
    'offer-basic': 'offerBasic',
    'offer-details': 'offerDetails',
    'offer-characteristics': 'offerCharacteristics',
    'activation-methods': 'activationMethods',
    'contact-information': 'contactInformation',
    'offer-validity': 'offerValidity',
    'energy-price-references': 'energyPriceReferences',
    'payment-methods': 'paymentMethods',
    'time-bands': 'timeBands',
    'additional-services': 'additionalServices',
    'issuer-details': 'issuerDetails',
    // Add more mappings as needed
  };
  
  // Get initial data for this step
  const formDataKey = stepToFormDataKey[step.id];
  const initialData = formDataKey ? formData[formDataKey] : undefined;
  
  // Dynamically select the form component based on the step configuration
  const FormComponent = useMemo(() => {
    const componentName = step.component as FormComponentName;
    
    // Check if the component exists in our registry
    if (componentName in formComponents) {
      return formComponents[componentName];
    }
    
    // Return null to render placeholder later
    return null;
  }, [step.component]);

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>{step.title}</CardTitle>
        <CardDescription>{step.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {FormComponent ? (
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
            <FormComponent initialData={initialData} onSubmit={onSubmit} />
          </Suspense>
        ) : (
          <FormPlaceholder step={step} onSubmit={onSubmit} />
        )}
      </CardContent>
    </Card>
  );
} 