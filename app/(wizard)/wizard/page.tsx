'use client';

import { WizardStepContent } from '@/components/wizard/wizard-step-content';
import { useWizardStore } from '@/store/wizard-store';
import { useStepper } from '@/components/wizard/stepper-layout';
import { getStepById } from '@/lib/wizard-config';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function WizardPage() {
  const { 
    formData,
    updateFormData
  } = useWizardStore();
  
  const stepper = useStepper();
  const { toast } = useToast();
  
  // Get the current step configuration using the currentId from stepperize
  const currentId = stepper.current.id;
  const currentStepConfig = getStepById(currentId);

  // Check if current step is visible and accessible using stepperize utilities
  const stepVisible = stepper.utils.isStepVisible(currentId);
  const stepAccessible = stepper.utils.isStepAccessible(currentId);

  // Handle form submission for current step
  const handleStepSubmit = async (data: Record<string, unknown>) => {
    try {
      const sectionKey = currentStepConfig?.id;
      
      if (sectionKey) {
        updateFormData(sectionKey, data);
        stepper.utils.markValid(sectionKey, true);
        
        toast({
          title: 'Step completed',
          description: `${currentStepConfig.title} has been saved successfully.`,
        });
      }
    } catch (error) {
      console.error('Error submitting step:', error);
      if (currentStepConfig) {
        stepper.utils.markValid(currentStepConfig.id, false);
        toast({
          title: 'Error saving step',
          description: 'Please check your input and try again.',
          variant: 'destructive',
        });
      }
    }
  };

  // Mark step as valid/invalid based on form state
  useEffect(() => {
    if (currentStepConfig && stepVisible && stepAccessible) {
      // Check if step has required data
      const stepData = formData[currentStepConfig.id];
      const hasData = stepData && Object.keys(stepData).length > 0;
      
      // For now, mark as valid if step has data or is optional
      // This will be enhanced with proper validation integration
      const isValid = hasData || currentStepConfig.isOptional;
      stepper.utils.markValid(currentStepConfig.id, Boolean(isValid));
    }
  }, [currentStepConfig, stepVisible, stepAccessible, formData, stepper]);

  // Show error if step is not visible
  if (!stepVisible) {
    return (
      <div className="text-center py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Step Not Available
          </h3>
          <p className="text-yellow-700 mb-4">
            This step is not currently visible based on your form selections. 
            Complete the required previous steps to unlock this section.
          </p>
          <div className="text-sm text-yellow-600">
            Current step: {currentStepConfig?.title || currentId}
          </div>
        </div>
      </div>
    );
  }

  // Show error if step is not accessible
  if (!stepAccessible) {
    return (
      <div className="text-center py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Complete Previous Steps
          </h3>
          <p className="text-blue-700 mb-4">
            This step requires completion of previous steps before you can access it.
          </p>
          <div className="text-sm text-blue-600">
            Current step: {currentStepConfig?.title || currentId}
          </div>
        </div>
      </div>
    );
  }

  // Show error if step configuration not found
  if (!currentStepConfig) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Step Configuration Error
          </h3>
          <p className="text-red-700 mb-4">
            Step configuration not found for: {currentId}
          </p>
          <div className="text-sm text-red-600">
            Please check your wizard configuration.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step header with conditional indicators */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {currentStepConfig.title}
            </h2>
            <p className="text-muted-foreground mt-1">
              {currentStepConfig.description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Optional step indicator */}
            {currentStepConfig.isOptional && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                Optional
              </span>
            )}
            
            {/* Validation status indicator */}
            {formData[currentStepConfig.id] && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                In Progress
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Step content */}
      <WizardStepContent
        step={currentStepConfig}
        onSubmit={handleStepSubmit}
      />
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 p-4 bg-gray-50 rounded-lg">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Debug Info (Development Only)
          </summary>
          <div className="mt-2 text-xs text-gray-600 space-y-1">
            <div>Current Step ID: {currentId}</div>
            <div>Step Visible: {stepVisible ? 'Yes' : 'No'}</div>
            <div>Step Accessible: {stepAccessible ? 'Yes' : 'No'}</div>
            <div>Step Optional: {currentStepConfig.isOptional ? 'Yes' : 'No'}</div>
            <div>Has Data: {formData[currentStepConfig.id] ? 'Yes' : 'No'}</div>
            <div>Dependencies: {currentStepConfig.dependsOn?.join(', ') || 'None'}</div>
          </div>
        </details>
      )}
    </div>
  );
} 