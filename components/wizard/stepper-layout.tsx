'use client';

import { defineStepper } from '@/components/stepper';
import { wizardSteps } from '@/lib/wizard-config';

// Convert wizard steps to stepperize format with conditional logic
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
export const stepOrder = wizardSteps.map(step => step.id) as const;
export type StepId = typeof stepOrder[number];

// Conditional logic functions (compatible with stepperize when helper)
export const stepConditions = {
  // Offer Characteristics: Show for FLAT offers OR electricity offers
  'offer-characteristics': (formData: any) => {
    const offerType = formData?.offerDetails?.TIPO_OFFERTA;
    const marketType = formData?.offerDetails?.TIPO_MERCATO;
    return offerType === '03' || marketType === '01';
  },

  // Regulated Components: Show only for electricity or gas markets (not dual fuel)
  'regulated-components': (formData: any) => {
    const marketType = formData?.offerDetails?.TIPO_MERCATO;
    return marketType === '01' || marketType === '02';
  },

  // Energy Price References: Show only for variable offers without type 04 discounts
  'energy-price-references': (formData: any) => {
    const offerType = formData?.offerDetails?.TIPO_OFFERTA;
    if (offerType !== '02') return false;
    
    // Hide if discount with TIPOLOGIA = '04' exists
    const discounts = formData?.discounts;
    if (discounts && Array.isArray(discounts)) {
      const hasType04Discount = discounts.some((discount: any) => discount?.TIPOLOGIA === '04');
      if (hasType04Discount) return false;
    }
    
    return true;
  },

  // Time Bands: Show only for electricity offers and not FLAT
  'time-bands': (formData: any) => {
    const marketType = formData?.offerDetails?.TIPO_MERCATO;
    const offerType = formData?.offerDetails?.TIPO_OFFERTA;
    return marketType === '01' && offerType !== '03';
  },

  // Dual Offers: Show only for dual fuel offers
  'dual-offers': (formData: any) => {
    const marketType = formData?.offerDetails?.TIPO_MERCATO;
    return marketType === '03';
  },

  // Green Energy: Show when energy type includes green options
  'green-energy': (formData: any) => {
    return formData?.energyType?.includesGreenOptions === true;
  },
};

// Dependency validation helpers
export const stepDependencies = {
  'offer-basic': ['identification'],
  'offer-details': ['identification'],
  'offer-characteristics': ['offer-details'],
  'activation-methods': ['identification'],
  'contact-information': ['identification'],
  'offer-validity': ['identification'],
  'payment-methods': ['identification'],
  'regulated-components': ['offer-details'],
  'energy-price-references': ['offer-details'],
  'time-bands': ['offer-details'],
  'dual-offers': ['offer-details'],
  'contractual-conditions': ['identification'],
  'offer-zones': ['identification'],
  'consumption-profile': ['energy-type'],
  'pricing-structure': ['energy-type', 'consumption-profile'],
  'additional-services': ['identification'],
  'connection-details': ['energy-type'],
  'summary-review': ['identification', 'offer-basic', 'issuer-details', 'recipient-details'],
};

// Helper function to check if a step should be visible
export const isStepVisible = (stepId: StepId, formData: any): boolean => {
  const condition = stepConditions[stepId];
  if (condition) {
    return condition(formData);
  }
  return true; // Always visible if no condition
};

// Helper function to check step dependencies
export const areStepDependenciesMet = (stepId: StepId, completedSteps: Set<StepId>): boolean => {
  const dependencies = stepDependencies[stepId];
  if (!dependencies) return true;
  
  return dependencies.every(depId => completedSteps.has(depId as StepId));
};

// Helper function to get visible and accessible steps
export const getVisibleSteps = (formData: any, completedSteps: Set<StepId> = new Set()): StepId[] => {
  return stepOrder.filter(stepId => {
    // Check visibility condition
    if (!isStepVisible(stepId, formData)) {
      return false;
    }
    
    // Check dependencies (for navigation purposes - don't filter out, just mark as inaccessible)
    return true;
  });
};

// Helper function to check if step is accessible (visible + dependencies met)
export const isStepAccessible = (stepId: StepId, formData: any, completedSteps: Set<StepId>): boolean => {
  return isStepVisible(stepId, formData) && areStepDependenciesMet(stepId, completedSteps);
};

// Market type constants for easier reference
export const MARKET_TYPES = {
  ELECTRICITY: '01',
  GAS: '02',
  DUAL_FUEL: '03',
} as const;

// Offer type constants for easier reference
export const OFFER_TYPES = {
  FIXED: '01',
  VARIABLE: '02',
  FLAT: '03',
} as const; 