// Wizard step configuration
export interface WizardStepConfig {
  id: string;
  title: string;
  description: string;
  icon?: string;
  component: string; // Component name to render
  validation?: string; // Validation schema name
  isOptional?: boolean;
  dependsOn?: string[]; // Step IDs that must be completed first
  isVisible?: (formData: any) => boolean; // Conditional visibility
}

export const wizardSteps: WizardStepConfig[] = [
  {
    id: 'identification',
    title: 'Identification Information',
    description: 'Enter VAT number and offer code',
    component: 'IdentificationForm',
    validation: 'identificationSchema',
  },
  {
    id: 'offer-basic',
    title: 'Basic Information',
    description: 'Enter basic offer details',
    component: 'OfferBasicForm',
    validation: 'offerBasicSchema',
    dependsOn: ['identification'],
  },
  {
    id: 'offer-details',
    title: 'Offer Details',
    description: 'Configure market type, client type, and other offer specifications',
    component: 'OfferDetailsForm',
    validation: 'offerDetailsSchema',
    dependsOn: ['identification'],
  },
  {
    id: 'offer-characteristics',
    title: 'Offer Characteristics',
    description: 'Define consumption and power limits for this offer',
    component: 'OfferCharacteristicsForm',
    validation: 'offerCharacteristicsSchema',
    dependsOn: ['offer-details'],
    isVisible: (formData) => {
      // Show for FLAT offers (consumption limits) or electricity offers (power limits)
      const offerType = formData?.offerDetails?.TIPO_OFFERTA;
      const marketType = formData?.offerDetails?.TIPO_MERCATO;
      return offerType === '03' || marketType === '01';
    },
  },
  {
    id: 'activation-methods',
    title: 'Activation Methods',
    description: 'Define how customers can activate this offer',
    component: 'ActivationMethodsForm',
    validation: 'activationMethodsSchema',
    dependsOn: ['identification'],
  },
  {
    id: 'contact-information',
    title: 'Contact Information',
    description: 'Customer service phone number and relevant URLs',
    component: 'ContactInformationForm',
    validation: 'contactInformationSchema',
    dependsOn: ['identification'],
  },
  {
    id: 'offer-validity',
    title: 'Offer Validity Period',
    description: 'Set the start and end dates for this offer',
    component: 'OfferValidityForm',
    validation: 'offerValiditySchema',
    dependsOn: ['identification'],
  },
  {
    id: 'payment-methods',
    title: 'Payment Methods',
    description: 'Select accepted payment methods for this offer',
    component: 'PaymentMethodsForm',
    validation: 'paymentMethodsSchema',
    dependsOn: ['identification'],
  },
  {
    id: 'regulated-components',
    title: 'Regulated Components',
    description: 'Select authority-defined price components (optional)',
    component: 'RegulatedComponentsForm',
    validation: 'regulatedComponentsSchema',
    dependsOn: ['offer-details'],
    isOptional: true,
    isVisible: (formData) => {
      // Show only for electricity or gas markets (not dual fuel)
      const marketType = formData?.offerDetails?.TIPO_MERCATO;
      return marketType === '01' || marketType === '02';
    },
  },
  {
    id: 'energy-price-references',
    title: 'Energy Price References',
    description: 'Price index selection for variable offers',
    component: 'EnergyPriceReferencesForm',
    validation: 'energyPriceReferencesSchema',
    dependsOn: ['offer-details'],
    isVisible: (formData) => {
      // Show only for variable offers (TIPO_OFFERTA = '02')
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
  },
  {
    id: 'time-bands',
    title: 'Price Type & Time Bands',
    description: 'Configure time band types and weekly schedules',
    component: 'TimeBandsForm',
    validation: 'timeBandsSchema',
    dependsOn: ['offer-details'],
    isVisible: (formData) => {
      // Show only for electricity offers (TIPO_MERCATO = '01') and not FLAT (TIPO_OFFERTA ≠ '03')
      const marketType = formData?.offerDetails?.TIPO_MERCATO;
      const offerType = formData?.offerDetails?.TIPO_OFFERTA;
      return marketType === '01' && offerType !== '03';
    },
  },
  {
    id: 'dual-offers',
    title: 'Dual Fuel Offer',
    description: 'Link electricity and gas offers for dual fuel package',
    component: 'DualOffersForm',
    validation: 'dualOffersSchema',
    dependsOn: ['offer-details'],
    isVisible: (formData) => {
      // Show only for dual fuel offers (TIPO_MERCATO = '03')
      const marketType = formData?.offerDetails?.TIPO_MERCATO;
      return marketType === '03';
    },
  },
  {
    id: 'contractual-conditions',
    title: 'Contractual Conditions',
    description: 'Specify terms and conditions for the offer',
    component: 'ContractualConditionsForm',
    validation: 'contractualConditionsSchema',
    dependsOn: ['identification'],
  },
  {
    id: 'offer-zones',
    title: 'Offer Zones',
    description: 'Specify geographical availability via regions, provinces, municipalities',
    component: 'OfferZonesForm',
    validation: 'offerZonesSchema',
    dependsOn: ['identification'],
    isOptional: true,
  },
  {
    id: 'issuer-details',
    title: 'Issuer Details',
    description: 'Company information for the offer issuer',
    component: 'IssuerDetailsForm',
    validation: 'companySchema',
  },
  {
    id: 'recipient-details',
    title: 'Recipient Details',
    description: 'Customer or recipient company information',
    component: 'RecipientDetailsForm',
    validation: 'companySchema',
  },
  {
    id: 'energy-type',
    title: 'Energy Type',
    description: 'Select the type of energy service',
    component: 'EnergyTypeForm',
    validation: 'energyTypeSchema',
  },
  {
    id: 'consumption-profile',
    title: 'Consumption Profile',
    description: 'Define energy consumption patterns',
    component: 'ConsumptionProfileForm',
    validation: 'consumptionProfileSchema',
    dependsOn: ['energy-type'],
  },
  {
    id: 'pricing-structure',
    title: 'Pricing Structure',
    description: 'Configure pricing tiers and rates',
    component: 'PricingStructureForm',
    validation: 'pricingStructureSchema',
    dependsOn: ['energy-type', 'consumption-profile'],
  },
  {
    id: 'contract-duration',
    title: 'Contract Duration',
    description: 'Set contract terms and duration',
    component: 'ContractDurationForm',
    validation: 'contractDurationSchema',
  },
  {
    id: 'green-energy',
    title: 'Green Energy Options',
    description: 'Configure renewable energy options',
    component: 'GreenEnergyForm',
    validation: 'greenEnergySchema',
    isOptional: true,
    isVisible: (formData) => formData.energyType?.includesGreenOptions,
  },
  {
    id: 'network-costs',
    title: 'Network Costs',
    description: 'Distribution and transmission costs',
    component: 'NetworkCostsForm',
    validation: 'networkCostsSchema',
  },
  {
    id: 'taxes-fees',
    title: 'Taxes & Fees',
    description: 'Applicable taxes and regulatory fees',
    component: 'TaxesFeesForm',
    validation: 'taxesFeesSchema',
  },
  {
    id: 'discounts',
    title: 'Discounts & Promotions',
    description: 'Apply any discounts or promotional rates',
    component: 'DiscountsForm',
    validation: 'discountsSchema',
    isOptional: true,
  },
  {
    id: 'payment-terms',
    title: 'Payment Terms',
    description: 'Define payment methods and schedules',
    component: 'PaymentTermsForm',
    validation: 'paymentTermsSchema',
  },
  {
    id: 'meter-reading',
    title: 'Meter Reading',
    description: 'Meter reading schedules and methods',
    component: 'MeterReadingForm',
    validation: 'meterReadingSchema',
  },
  {
    id: 'connection-details',
    title: 'Connection Details',
    description: 'Power connection specifications',
    component: 'ConnectionDetailsForm',
    validation: 'connectionDetailsSchema',
    dependsOn: ['energy-type'],
  },
  {
    id: 'service-level',
    title: 'Service Level',
    description: 'Customer service and support options',
    component: 'ServiceLevelForm',
    validation: 'serviceLevelSchema',
    isOptional: true,
  },
  {
    id: 'special-conditions',
    title: 'Special Conditions',
    description: 'Any special terms or conditions',
    component: 'SpecialConditionsForm',
    validation: 'specialConditionsSchema',
    isOptional: true,
  },
  {
    id: 'regulatory-compliance',
    title: 'Regulatory Compliance',
    description: 'Compliance with energy regulations',
    component: 'RegulatoryComplianceForm',
    validation: 'regulatoryComplianceSchema',
  },
  {
    id: 'summary-review',
    title: 'Summary & Review',
    description: 'Review all offer details before finalizing',
    component: 'SummaryReviewForm',
    dependsOn: ['identification', 'offer-basic', 'issuer-details', 'recipient-details'],
  },
];

// Helper function to get step by ID
export const getStepById = (id: string): WizardStepConfig | undefined => {
  return wizardSteps.find((step) => step.id === id);
};

// Helper function to get step index
export const getStepIndex = (id: string): number => {
  return wizardSteps.findIndex((step) => step.id === id);
};

// Helper function to check if step is accessible
export const isStepAccessible = (
  stepId: string,
  completedSteps: Set<number>,
  formData: any
): boolean => {
  const step = getStepById(stepId);
  if (!step) return false;

  // Check visibility
  if (step.isVisible && !step.isVisible(formData)) {
    return false;
  }

  // Check dependencies
  if (step.dependsOn) {
    for (const depId of step.dependsOn) {
      const depIndex = getStepIndex(depId);
      if (depIndex !== -1 && !completedSteps.has(depIndex)) {
        return false;
      }
    }
  }

  return true;
};

// Get visible steps based on form data
export const getVisibleSteps = (formData: any): WizardStepConfig[] => {
  return wizardSteps.filter((step) => {
    if (step.isVisible) {
      return step.isVisible(formData);
    }
    return true;
  });
}; 