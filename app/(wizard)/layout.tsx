'use client';

import { useWizardStore } from '@/store/wizard-store';
import { Stepper, steps as wizardStepsArray } from '@/components/wizard/stepper-layout';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, RotateCcw, CheckCircle, Circle, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormProvider, useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import type { StepId } from '@/components/wizard/stepper-layout';
import type * as Stepperize from '@stepperize/react';

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  const { 
    currentId, 
    formData,
    completed,
    setCurrentId,
    resetStepper,
    getVisibleSteps,
    isStepVisible,
    isStepAccessible,
    saveDraft,
    isDirty 
  } = useWizardStore();
  
  const { toast } = useToast();

  // Add hydration flag to ensure consistent rendering
  const [isHydrated, setIsHydrated] = useState(false);
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Calculate visible steps consistently
  const visibleSteps = useMemo(() => {
    if (!isHydrated) {
      // Return initial state during SSR to match server rendering
      return ['identification', 'offer-basic', 'offer-details'];
    }
    return getVisibleSteps();
  }, [getVisibleSteps, isHydrated]);
  
  // Default form for wizard-wide state
  const methods = useForm({
    defaultValues: formData,
    mode: 'onChange',
  });

  // Keep form in sync with store
  useEffect(() => {
    methods.reset(formData);
  }, [formData, methods]);

  if (!isHydrated) {
    // Return minimal SSR-compatible version
    return (
      <div className="flex min-h-screen flex-col">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <FormProvider {...methods}>
        <Stepper.Provider
          initialStep={currentId}
          onChange={(step: Stepperize.Step) => {
            // Keep Zustand in sync with stepperize
            setCurrentId(step.id as StepId);
          }}
          className="flex min-h-screen flex-col"
        >
          {({ methods }) => (
            <>
              {/* Header */}
              <header className="border-b bg-background">
                <div className="container mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">Energy Offer Wizard</h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Step {visibleSteps.indexOf(currentId) + 1} of {visibleSteps.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          resetStepper();
                          methods.reset();
                          toast({
                            title: 'Wizard reset',
                            description: 'All progress has been cleared.',
                          });
                        }}
                        className="gap-2"
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
                        .filter(step => isStepVisible(step.id as StepId))
                        .map((step) => {
                          const stepId = step.id as StepId;
                          // Ensure boolean values for consistent hydration
                          const isAccessible = Boolean(isStepAccessible(stepId));
                          const isCompleted = Boolean(completed.has(stepId));
                          const isActive = Boolean(currentId === stepId);
                          const isValid = Boolean(completed.has(stepId));

                          // Status information for tooltip - fix logic to match actual state
                          const stepStatus = isActive 
                            ? 'In Progress' 
                            : isCompleted && !isActive
                            ? 'Completed' 
                            : isAccessible 
                            ? 'Available' 
                            : 'Locked';
                          
                          const stepIcon = isActive
                            ? <Circle className="h-3 w-3" />
                            : isCompleted && !isActive
                            ? <CheckCircle className="h-3 w-3" />
                            : isAccessible 
                            ? <Circle className="h-3 w-3" />
                            : <Lock className="h-3 w-3" />;

                          return (
                            <Tooltip key={step.id}>
                              <TooltipTrigger asChild>
                                <Stepper.Step
                                  of={step.id}
                                  className={`
                                    w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium
                                    transition-all duration-200 relative cursor-pointer
                                    ${isActive
                                      ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                                      : isCompleted
                                      ? 'bg-green-500 text-white border-green-500'
                                      : isAccessible
                                      ? 'bg-background border-border hover:border-primary hover:bg-primary/10'
                                      : 'bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50'
                                    }
                                  `}
                                  onClick={() => {
                                    if (isAccessible) {
                                      // Navigate via stepperize (store sync handled by onStepChange)
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
                                    } else {
                                      toast({
                                        title: 'Cannot navigate to this step',
                                        description: 'Please complete previous steps or check step requirements.',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                  disabled={!isAccessible}
                                >
                                  {isCompleted ? '✓' : visibleSteps.indexOf(stepId) + 1}
                                  {isValid && !isCompleted && !isActive && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                  )}
                                </Stepper.Step>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    {stepIcon}
                                    <span className="font-medium">{step.title}</span>
                                  </div>
                                  {step.description && (
                                    <p className="text-xs text-muted-foreground">{step.description}</p>
                                  )}
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Step {visibleSteps.indexOf(stepId) + 1} of {visibleSteps.length}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      stepStatus === 'In Progress'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                        : stepStatus === 'Completed' 
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                        : stepStatus === 'Available'
                                        ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                      {stepStatus}
                                    </span>
                                  </div>
                                  {isValid && !isCompleted && (
                                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>Form validated</span>
                                    </div>
                                  )}
                                  {!isAccessible && (
                                    <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                      <Lock className="h-3 w-3" />
                                      <span>Complete previous steps to unlock</span>
                                    </div>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                    </div>
                  </div>
                  
                  {/* Current step info */}
                  <div className="text-center mt-4 space-y-1">
                    <p className="font-medium text-foreground">
                      {methods.all.find(s => s.id === currentId)?.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Step {visibleSteps.indexOf(currentId) + 1} of {visibleSteps.length}
                    </p>
                  </div>
                </div>
              </Stepper.Navigation>

              {/* Main content area */}
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-8">
                  {/* Use stepperize switch for proper content switching */}
                  {methods.switch(
                    Object.fromEntries(
                      visibleSteps.map(panelId => [
                        panelId,
                        (_step: Stepperize.Step) => (
                          <Stepper.Panel key={panelId}>
                            {children}
                          </Stepper.Panel>
                        )
                      ])
                    )
                  )}
                </div>
              </main>

              {/* Footer Controls */}
              <footer className="border-t bg-background p-4">
                <div className="container mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
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
                          const isCurrentStepValid = completed.has(currentId);
                          if (isCurrentStepValid) {
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
                      disabled={!completed.has(currentId) && visibleSteps.indexOf(currentId) !== visibleSteps.length - 1}
                      className="gap-2"
                    >
                      {visibleSteps.indexOf(currentId) === visibleSteps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>

                  {isDirty && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          saveDraft();
                          toast({
                            title: 'Draft saved',
                            description: 'Your progress has been saved.',
                          });
                        }}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Draft
                      </Button>
                    </div>
                  )}
                </div>
              </footer>
            </>
          )}
        </Stepper.Provider>
      </FormProvider>
    </TooltipProvider>
  );
} 