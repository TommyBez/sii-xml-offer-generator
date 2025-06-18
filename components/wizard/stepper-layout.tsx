'use client';

import { defineStepper } from '@/components/stepper';
import { wizardSteps } from '@/lib/wizard-config';
import { 
  isStepVisible,
  areStepDependenciesMet,
  isStepAccessible,
  getVisibleSteps,
  getAccessibleSteps,
  type FormData
} from '@/lib/step-conditions';

// Convert wizard steps to stepperize format
const stepperSteps = wizardSteps.map(step => ({
  id: step.id,
  title: step.title,
  description: step.description,
  isOptional: step.isOptional,
}));

// Define the stepper with all steps from wizard configuration
export const { Stepper, useStepper, steps, utils } = defineStepper(
  ...stepperSteps
);

// Export step order and types for type safety
export const stepOrder = wizardSteps.map(step => step.id);
export type StepId = typeof stepOrder[number];

// Re-export functions from step-conditions for backward compatibility
export { 
  isStepVisible,
  areStepDependenciesMet, 
  isStepAccessible,
  getVisibleSteps,
  getAccessibleSteps,
  MARKET_TYPES,
  OFFER_TYPES,
  type FormData
} from '@/lib/step-conditions';

// Helper function for legacy compatibility - adapts to wizard store format
export const getVisibleStepsLegacy = (formData: any, completedSteps: Set<string> = new Set()): string[] => {
  return getVisibleSteps(formData as FormData, stepOrder);
};

// Helper function for legacy compatibility - adapts to wizard store format
export const isStepAccessibleLegacy = (stepId: string, formData: any, completedSteps: Set<string>): boolean => {
  return isStepAccessible(stepId as StepId, formData as FormData, completedSteps as Set<StepId>);
}; 