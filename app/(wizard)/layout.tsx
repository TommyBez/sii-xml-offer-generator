'use client';

import { useWizardStore } from '@/store/wizard-store';
import { Stepper } from '@/components/wizard/stepper-layout';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormProvider, useForm } from 'react-hook-form';
import { useEffect, useMemo } from 'react';

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const { 
    currentId, 
    formData,
    validMap, 
    completed,
    goTo, 
    next, 
    prev, 
    markValid, 
    resetStepper,
    getVisibleSteps,
    getAccessibleSteps,
    isStepVisible,
    isStepAccessible,
    canNavigateToStepId,
    saveDraft,
    isDirty 
  } = useWizardStore();
  
  const { toast } = useToast();

  // Set up form provider for the entire wizard
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: formData,
  });

  // Sync form data with store
  useEffect(() => {
    const subscription = formMethods.watch((data) => {
      // Update store when form changes
      const currentStepId = currentId;
      if (data && data[currentStepId]) {
        // This will be handled by individual form components
      }
    });
    return () => subscription.unsubscribe();
  }, [formMethods, currentId]);

  // Get visible steps based on form data and conditional logic
  const visibleSteps = useMemo(() => getVisibleSteps(), [getVisibleSteps]);
  const accessibleSteps = useMemo(() => getAccessibleSteps(), [getAccessibleSteps]);

  // Handle save draft
  const handleSaveDraft = () => {
    saveDraft();
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved.',
    });
  };

  // Handle reset
  const handleReset = () => {
    resetStepper();
    formMethods.reset({});
    toast({
      title: 'Wizard reset',
      description: 'All data has been cleared.',
    });
  };

  return (
    <FormProvider {...formMethods}>
      <Stepper.Provider
        initialStep={currentId}
        onStepChange={(step) => {
          const stepId = step.id as any;
          if (canNavigateToStepId(stepId)) {
            goTo(stepId);
          } else {
            toast({
              title: 'Cannot navigate to this step',
              description: 'Please complete previous steps or check step requirements.',
              variant: 'destructive',
            });
          }
        }}
        className="flex min-h-screen flex-col"
      >
        {({ methods }) => (
          <>
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Energy Offer Wizard</h1>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      Step {visibleSteps.indexOf(currentId) + 1} of {visibleSteps.length}
                    </div>
                    {isDirty && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveDraft}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Draft
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </header>

            {/* Stepper Navigation - horizontally scrollable */}
            <Stepper.Navigation className="border-b bg-background">
              <div className="container mx-auto px-4 py-4">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 px-4 min-w-max">
                    {methods.all
                      .filter(step => isStepVisible(step.id as any, formData))
                      .map((step, index) => {
                        const stepId = step.id as any;
                        const isAccessible = isStepAccessible(stepId, formData, completed);
                        const isCompleted = completed.has(stepId);
                        const isActive = currentId === stepId;
                        const isValid = validMap[stepId];

                        return (
                          <Stepper.Step
                            key={step.id}
                            of={step.id}
                            onClick={() => {
                              if (isAccessible) {
                                methods.goTo(step.id);
                                // Scroll active step into view
                                setTimeout(() => {
                                  const activeElement = document.querySelector('[data-state="active"]');
                                  if (activeElement) {
                                    activeElement.scrollIntoView({ 
                                      behavior: 'smooth', 
                                      block: 'nearest',
                                      inline: 'center' 
                                    });
                                  }
                                }, 100);
                              }
                            }}
                            className={`
                              flex items-center justify-center rounded-full transition-all
                              h-10 w-10 text-sm font-medium flex-shrink-0
                              ${isActive 
                                ? 'bg-primary text-primary-foreground shadow-md' 
                                : isAccessible 
                                  ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm' 
                                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                              }
                              ${isCompleted && !isActive ? 'bg-green-500 text-white' : ''}
                            `}
                            disabled={!isAccessible}
                            title={`${step.title}${isCompleted ? ' (Completed)' : ''}`}
                          >
                            {/* Step number or checkmark */}
                            {isCompleted && !isActive ? '✓' : index + 1}
                            
                            {/* Small validation indicator dot */}
                            {isValid && !isCompleted && !isActive && (
                              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                            )}
                          </Stepper.Step>
                        );
                      })}
                  </div>
                </div>
                
                {/* Current step info below the numbers */}
                <div className="text-center mt-3">
                  <p className="text-sm font-medium text-foreground">
                    {methods.all.find(s => s.id === currentId)?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Step {visibleSteps.indexOf(currentId) + 1} of {visibleSteps.length}
                  </p>
                </div>
              </div>
            </Stepper.Navigation>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-4 py-8">
                {/* Use stepperize switch to conditionally render content */}
                {methods.switch(
                  // Create switch object for all visible steps
                  visibleSteps.reduce((acc, stepId) => {
                    acc[stepId] = () => (
                      <Stepper.Panel of={stepId}>
                        {children}
                      </Stepper.Panel>
                    );
                    return acc;
                  }, {} as Record<string, () => React.ReactNode>)
                )}
              </div>
            </main>

            {/* Navigation controls */}
            <Stepper.Controls className="border-t bg-background">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      prev();
                      methods.prev();
                    }}
                    disabled={visibleSteps.indexOf(currentId) === 0}
                    className="gap-2"
                  >
                    Previous
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    {completed.size} of {visibleSteps.length} steps completed
                  </div>

                  <Button
                    onClick={() => {
                      const currentIndex = visibleSteps.indexOf(currentId);
                      const isLastVisibleStep = currentIndex === visibleSteps.length - 1;
                      
                      if (isLastVisibleStep) {
                        toast({
                          title: 'Wizard completed!',
                          description: 'You have completed all visible steps.',
                        });
                      } else {
                        const isCurrentStepValid = validMap[currentId];
                        if (isCurrentStepValid) {
                          next();
                          methods.next();
                        } else {
                          toast({
                            title: 'Please complete current step',
                            description: 'Complete all required fields before proceeding.',
                            variant: 'destructive',
                          });
                        }
                      }
                    }}
                    disabled={!validMap[currentId]}
                    className="gap-2"
                  >
                    {visibleSteps.indexOf(currentId) === visibleSteps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div>
              </div>
            </Stepper.Controls>
          </>
        )}
      </Stepper.Provider>
    </FormProvider>
  );
} 