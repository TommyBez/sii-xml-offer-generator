import { defineStepper } from '@stepperize/react';
import {
  identificationSchema,
  offerBasicSchema,
  offerDetailsSchema,
  offerCharacteristicsSchema,
  activationMethodsSchema,
  contactInformationSchema,
  energyPriceReferencesSchema,
  offerValiditySchema,
  paymentMethodsSchema,
  regulatedComponentsSchema,
  offerZonesSchema,
  discountsSchema,
  additionalServicesSchema,
  issuerDetailsSchema,
  recipientDetailsSchema,
  energyTypeSchema,
  timeBandsSchema,
  dualOffersSchema,
  contractualConditionsSchema,
  consumptionProfileSchema,
  companyComponentsSchema,
} from '@/schemas';

// Define the stepper with properly typed steps
export const { useStepper } = defineStepper(
  {
    id: 'identification',
    label: 'Identification Information',
    description: 'Enter VAT number and offer code',
    schema: identificationSchema,
  },
  {
    id: 'offer-basic',
    label: 'Basic Information',
    description: 'Enter basic offer details',
    schema: offerBasicSchema,
  },
  {
    id: 'offer-details',
    label: 'Offer Details',
    description: 'Configure market type, client type, and other offer specifications',
    schema: offerDetailsSchema,
  },
  {
    id: 'offer-characteristics',
    label: 'Offer Characteristics',
    description: 'Define consumption and power limits for this offer',
    schema: offerCharacteristicsSchema,
  },
  {
    id: 'activation-methods',
    label: 'Activation Methods',
    description: 'Define how customers can activate this offer',
    schema: activationMethodsSchema,
  },
  {
    id: 'contact-information',
    label: 'Contact Information',
    description: 'Customer service phone number and relevant URLs',
    schema: contactInformationSchema,
  },
  {
    id: 'offer-validity',
    label: 'Offer Validity Period',
    description: 'Set the start and end dates for this offer',
    schema: offerValiditySchema,
  },
  {
    id: 'payment-methods',
    label: 'Payment Methods',
    description: 'Select accepted payment methods for this offer',
    schema: paymentMethodsSchema,
  },
  {
    id: 'regulated-components',
    label: 'Regulated Components',
    description: 'Select authority-defined price components (optional)',
    schema: regulatedComponentsSchema,
  },
  {
    id: 'energy-price-references',
    label: 'Energy Price References',
    description: 'Price index selection for variable offers',
    schema: energyPriceReferencesSchema,
  },
  {
    id: 'time-bands',
    label: 'Price Type & Time Bands',
    description: 'Configure time band types and weekly schedules',
    schema: timeBandsSchema,
  },
  {
    id: 'dual-offers',
    label: 'Dual Fuel Offer',
    description: 'Link electricity and gas offers for dual fuel package',
    schema: dualOffersSchema,
  },
  {
    id: 'contractual-conditions',
    label: 'Contractual Conditions',
    description: 'Specify terms and conditions for the offer',
    schema: contractualConditionsSchema,
  },
  {
    id: 'offer-zones',
    label: 'Offer Zones',
    description: 'Specify geographical availability via regions, provinces, municipalities',
    schema: offerZonesSchema,
  },
  {
    id: 'issuer-details',
    label: 'Issuer Details',
    description: 'Company information for the offer issuer',
    schema: issuerDetailsSchema,
  },
  {
    id: 'recipient-details',
    label: 'Recipient Details',
    description: 'Customer or recipient company information',
    schema: recipientDetailsSchema,
  },
  {
    id: 'energy-type',
    label: 'Energy Type',
    description: 'Select the type of energy service',
    schema: energyTypeSchema,
  },
  {
    id: 'consumption-profile',
    label: 'Consumption Profile',
    description: 'Define energy consumption patterns',
    schema: consumptionProfileSchema,
  },
  {
    id: 'discounts',
    label: 'Discounts & Promotions',
    description: 'Apply any discounts or promotional rates',
    schema: discountsSchema,
  },
  {
    id: 'additional-services',
    label: 'Additional Products & Services',
    description: 'Optional products and services to enhance your offer',
    schema: additionalServicesSchema,
  },
  {
    id: 'company-components',
    label: 'Company Components',
    description: 'Define custom pricing components for your offer',
    schema: companyComponentsSchema,
  },
);

// Export the step IDs type
export type StepId = Parameters<ReturnType<typeof useStepper>['get']>[0];

// Helper function to get step metadata
export const getStepMetadata = (stepId: StepId) => {
  const stepper = useStepper();
  const step = stepper.get(stepId);
  return {
    id: step.id,
    label: step.label,
    description: step.description,
    schema: step.schema,
  };
}; 