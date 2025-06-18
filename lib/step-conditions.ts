import type { StepId } from '@/lib/stepper';

// FormData type based on the wizard store structure
export interface FormData {
  identification?: {
    PIVA_UTENTE?: string;
    COD_OFFERTA?: string;
  };
  offerDetails?: {
    TIPO_MERCATO?: string;
    TIPO_OFFERTA?: string;
    [key: string]: any;
  };
  energyType?: {
    type?: string;
    includesGreenOptions?: boolean;
    TIPO_MERCATO?: string;
    AZIONE?: string;
  };
  discounts?: Array<{
    TIPOLOGIA?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

// Market type constants
export const MARKET_TYPES = {
  ELECTRICITY: '01',
  GAS: '02',
  DUAL_FUEL: '03',
} as const;

// Offer type constants
export const OFFER_TYPES = {
  FIXED: '01',
  VARIABLE: '02',
  FLAT: '03',
} as const;

// Discount type constants
export const DISCOUNT_TYPES = {
  TYPE_04: '04', // Special discount type that affects energy price references
} as const;

/**
 * Check if offer characteristics step should be visible
 * Show for FLAT offers (consumption limits) or electricity offers (power limits)
 */
export const isOfferCharacteristicsVisible = (data: FormData): boolean => {
  const { TIPO_OFFERTA, TIPO_MERCATO } = data.offerDetails ?? {};
  return TIPO_OFFERTA === OFFER_TYPES.FLAT || TIPO_MERCATO === MARKET_TYPES.ELECTRICITY;
};

/**
 * Check if regulated components step should be visible
 * Show only for electricity or gas markets (not dual fuel)
 */
export const isRegulatedComponentsVisible = (data: FormData): boolean => {
  const marketType = data.offerDetails?.TIPO_MERCATO;
  return marketType === MARKET_TYPES.ELECTRICITY || marketType === MARKET_TYPES.GAS;
};

/**
 * Check if energy price references step should be visible
 * Show only for variable offers (TIPO_OFFERTA = '02') without type 04 discounts
 */
export const isEnergyPriceReferencesVisible = (data: FormData): boolean => {
  const offerType = data.offerDetails?.TIPO_OFFERTA;
  if (offerType !== OFFER_TYPES.VARIABLE) return false;
  
  // Hide if discount with TIPOLOGIA = '04' exists
  const discounts = data.discounts;
  if (discounts && Array.isArray(discounts)) {
    const hasType04Discount = discounts.some((discount: any) => 
      discount?.TIPOLOGIA === DISCOUNT_TYPES.TYPE_04
    );
    if (hasType04Discount) return false;
  }
  
  return true;
};

/**
 * Check if time bands step should be visible
 * Show only for electricity offers (TIPO_MERCATO = '01') and not FLAT (TIPO_OFFERTA ≠ '03')
 */
export const isTimeBandsVisible = (data: FormData): boolean => {
  const marketType = data.offerDetails?.TIPO_MERCATO;
  const offerType = data.offerDetails?.TIPO_OFFERTA;
  return marketType === MARKET_TYPES.ELECTRICITY && offerType !== OFFER_TYPES.FLAT;
};

/**
 * Check if dual offers step should be visible
 * Show only for dual fuel offers (TIPO_MERCATO = '03')
 */
export const isDualOffersVisible = (data: FormData): boolean => {
  const marketType = data.offerDetails?.TIPO_MERCATO;
  return marketType === MARKET_TYPES.DUAL_FUEL;
};

/**
 * Check if green energy step should be visible
 * Show when energy type includes green options
 */
export const isGreenEnergyVisible = (data: FormData): boolean => {
  return data.energyType?.includesGreenOptions === true;
};

// Map of step IDs to their visibility functions
export const stepVisibilityMap: Record<string, (data: FormData) => boolean> = {
  'offer-characteristics': isOfferCharacteristicsVisible,
  'regulated-components': isRegulatedComponentsVisible,
  'energy-price-references': isEnergyPriceReferencesVisible,
  'time-bands': isTimeBandsVisible,
  'dual-offers': isDualOffersVisible,
  'green-energy': isGreenEnergyVisible,
};

/**
 * Check if a step should be visible based on form data
 */
export const isStepVisible = (stepId: StepId, data: FormData): boolean => {
  const visibilityFunction = stepVisibilityMap[stepId];
  if (visibilityFunction) {
    return visibilityFunction(data);
  }
  return true; // Always visible if no condition defined
};

// Step dependencies mapping
export const stepDependenciesMap: Record<string, StepId[]> = {
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

/**
 * Check if step dependencies are met
 */
export const areStepDependenciesMet = (stepId: StepId, completedSteps: Set<StepId>): boolean => {
  const dependencies = stepDependenciesMap[stepId];
  if (!dependencies) return true;
  
  return dependencies.every(depId => completedSteps.has(depId));
};

/**
 * Check if a step is accessible (visible + dependencies met)
 */
export const isStepAccessible = (stepId: StepId, data: FormData, completedSteps: Set<StepId>): boolean => {
  return isStepVisible(stepId, data) && areStepDependenciesMet(stepId, completedSteps);
};

/**
 * Get all visible steps based on form data
 */
export const getVisibleSteps = (data: FormData, allSteps: StepId[]): StepId[] => {
  return allSteps.filter(stepId => isStepVisible(stepId, data));
};

/**
 * Get all accessible steps (visible + dependencies met)
 */
export const getAccessibleSteps = (data: FormData, allSteps: StepId[], completedSteps: Set<StepId>): StepId[] => {
  return allSteps.filter(stepId => isStepAccessible(stepId, data, completedSteps));
}; 