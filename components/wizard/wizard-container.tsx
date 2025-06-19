/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useWizardStore, type WizardFormData } from '@/store/wizard-store';
import { getVisibleSteps, isStepAccessible } from '@/lib/wizard-config';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';
import { WizardStepContent } from './wizard-step-content';
import { WizardNavigation } from './wizard-navigation';

// Default values for form fields to prevent uncontrolled to controlled warnings
const getDefaultFormValues = (existingData: Partial<WizardFormData>): Partial<WizardFormData> => {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return {
    identification: {
      PIVA_UTENTE: '',
      COD_OFFERTA: '',
      ...existingData.identification,
    },
    offerNumber: existingData.offerNumber || '',
    date: existingData.date || today,
    validUntil: existingData.validUntil || thirtyDaysFromNow,
    currency: existingData.currency || 'EUR',
    paymentTerms: existingData.paymentTerms || '',
    deliveryTerms: existingData.deliveryTerms || '',
    notes: existingData.notes || '',
    issuer: {
      id: '',
      name: '',
      vatNumber: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      email: '',
      phone: '',
      ...existingData.issuer,
    },
    recipient: {
      id: '',
      name: '',
      vatNumber: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      email: '',
      phone: '',
      ...existingData.recipient,
    },
    recipientDetails: {
      RAGIONE_SOCIALE: '',
      CODICE_FISCALE: '',
      INDIRIZZO: '',
      CAP: '',
      COMUNE: '',
      PROVINCIA: '',
      PARTITA_IVA: '',
      TELEFONO: '',
      ...existingData.recipientDetails,
    },
    items: existingData.items || [],
    ...existingData,
  };
};

export function WizardContainer() {
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const {
    currentStep,
    formData,
    isDirty,
    completedSteps,
    setCurrentStep,
    updateFormData,
    markStepCompleted,
    saveDraft,
    canNavigateToStep,
    resetWizard,
  } = useWizardStore();

  // Get visible steps based on form data
  const visibleSteps = getVisibleSteps(formData);
  const currentStepConfig = visibleSteps[currentStep];

  // Form methods with proper default values
  const methods = useForm<Partial<WizardFormData>>({
    defaultValues: getDefaultFormValues(formData),
    mode: 'onChange',
  });

  // Track if we've already reset the form with stored data
  const hasRestoredRef = useRef(false);

  // Sync form with stored data after rehydration
  useEffect(() => {
    // Only restore once when we have data and haven't restored yet
    if (!hasRestoredRef.current && Object.keys(formData).length > 0) {
      const defaultValues = getDefaultFormValues(formData);
      methods.reset(defaultValues);
      hasRestoredRef.current = true;
    }
  }, [formData, methods]); // Re-run when formData changes (e.g., after rehydration)

  // Watch form changes and update store in real-time
  useEffect(() => {
    const subscription = methods.watch((formValues) => {
      // Update the store with current form values
      if (currentStepConfig) {
        const sectionKey = currentStepConfig.id;
        const sectionData = formValues[sectionKey];
        if (sectionData) {
          updateFormData(sectionKey, sectionData);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [methods, currentStepConfig, updateFormData]);

  // Auto-save functionality
  useEffect(() => {
    if (!isDirty) return;

    const timeoutId = setTimeout(() => {
      saveDraft();
      toast({
        title: 'Draft saved',
        description: 'Your progress has been saved automatically.',
      });
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [isDirty, saveDraft, toast]);

  // Handle step navigation
  const handleStepChange = useCallback(
    (stepIndex: number) => {
      if (!canNavigateToStep(stepIndex)) {
        toast({
          title: 'Cannot navigate to this step',
          description: 'Please complete the required previous steps first.',
          variant: 'destructive',
        });
        return;
      }

      // Check if current step is accessible
      const targetStep = visibleSteps[stepIndex];
      if (!isStepAccessible(targetStep.id, completedSteps, formData)) {
        toast({
          title: 'Step not accessible',
          description: 'This step depends on other steps that are not completed yet.',
          variant: 'destructive',
        });
        return;
      }

      setCurrentStep(stepIndex);
    },
    [canNavigateToStep, completedSteps, formData, setCurrentStep, toast, visibleSteps]
  );

  // Handle form submission for current step
  const handleStepSubmit = useCallback(
    async (data: any) => {
      try {
        // Get the section key from the current step
        const sectionKey = currentStepConfig?.id;
        
        // Update form data for the current section
        // The forms submit data directly, not nested
        if (sectionKey) {
          updateFormData(sectionKey, data);
          markStepCompleted(currentStep);

          // Move to next step if available
          if (currentStep < visibleSteps.length - 1) {
            handleStepChange(currentStep + 1);
          } else {
            toast({
              title: 'All steps completed!',
              description: 'You can now review and submit your offer.',
            });
          }
        }
      } catch (error) {
        console.error('Error submitting step:', error);
        toast({
          title: 'Error',
          description: 'Failed to save step data. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [currentStep, currentStepConfig, updateFormData, markStepCompleted, visibleSteps.length, handleStepChange, toast]
  );

  // Handle manual save
  const handleManualSave = useCallback(() => {
    saveDraft();
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved.',
    });
  }, [saveDraft, toast]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetWizard();
    methods.reset(getDefaultFormValues({}));
    hasRestoredRef.current = false;
    setShowResetDialog(false);
    toast({
      title: 'Data reset',
      description: 'All form data has been cleared.',
    });
  }, [resetWizard, methods, toast]);

  // Handle browser navigation warnings
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Enable keyboard navigation
  useKeyboardNavigation({
    onNext: () => {
      if (canNavigateToStep(currentStep + 1)) {
        methods.handleSubmit(handleStepSubmit)();
      }
    },
    onPrevious: () => {
      if (currentStep > 0) {
        handleStepChange(currentStep - 1);
      }
    },
    onSave: handleManualSave,
    canGoNext: canNavigateToStep(currentStep + 1),
    canGoPrevious: currentStep > 0,
  });

  if (!currentStepConfig) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No wizard steps configured. Please check your configuration.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col min-h-screen">
        {/* Header with progress */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Energy Offer Wizard</h1>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {visibleSteps.length}
                </div>
                {isDirty && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualSave}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResetDialog(true)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Step content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <WizardStepContent
              step={currentStepConfig}
              onSubmit={handleStepSubmit}
            />
          </div>
        </main>

        {/* Bottom navigation */}
        <WizardNavigation
          currentStep={currentStep}
          totalSteps={visibleSteps.length}
          canGoBack={currentStep > 0}
          canGoForward={canNavigateToStep(currentStep + 1)}
          onPrevious={() => handleStepChange(currentStep - 1)}
          onNext={() => methods.handleSubmit(handleStepSubmit)()}
          isLastStep={currentStep === visibleSteps.length - 1}
          className="border-t"
        />

        {/* Reset confirmation dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset all data?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will clear all your progress and cannot be undone. 
                All form data, completed steps, and saved drafts will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Reset All Data
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </FormProvider>
  );
} 