// Form component registry for dynamic imports
import { lazy } from 'react';

export const formComponents = {
  OfferBasicForm: lazy(() => import('./offer-basic-form').then(mod => ({ default: mod.OfferBasicForm }))),
  IdentificationForm: lazy(() => import('./identification-form').then(mod => ({ default: mod.IdentificationForm }))),
  OfferDetailsForm: lazy(() => import('./offer-details-form').then(mod => ({ default: mod.OfferDetailsForm }))),
  ActivationMethodsForm: lazy(() => import('./activation-methods-form').then(mod => ({ default: mod.ActivationMethodsForm }))),
  ContactInformationForm: lazy(() => import('./contact-information-form').then(mod => ({ default: mod.ContactInformationForm }))),
  EnergyPriceReferencesForm: lazy(() => import('./energy-price-references-form').then(mod => ({ default: mod.EnergyPriceReferencesForm }))),
  OfferValidityForm: lazy(() => import('./offer-validity-form').then(mod => ({ default: mod.OfferValidityForm }))),
  OfferCharacteristicsForm: lazy(() => import('./offer-characteristics-form').then(mod => ({ default: mod.OfferCharacteristicsForm }))),
  DualOffersForm: lazy(() => import('./dual-offers-form').then(mod => ({ default: mod.DualOffersForm }))),
  PaymentMethodsForm: lazy(() => import('./payment-methods-form').then(mod => ({ default: mod.PaymentMethodsForm }))),
  RegulatedComponentsForm: lazy(() => import('./regulated-components-form').then(mod => ({ default: mod.RegulatedComponentsForm }))),
  TimeBandsForm: lazy(() => import('./time-bands-form').then(mod => ({ default: mod.TimeBandsForm }))),
  CompanyComponentsForm: lazy(() => import('./company-components-form').then(mod => ({ default: mod.CompanyComponentsForm }))),
  ContractualConditionsForm: lazy(() => import('./contractual-conditions-form').then(mod => ({ default: mod.ContractualConditionsForm }))),
  OfferZonesForm: lazy(() => import('./offer-zones-form').then(mod => ({ default: mod.OfferZonesForm }))),
  DiscountsForm: lazy(() => import('./discounts-form').then(mod => ({ default: mod.DiscountsForm }))),
  AdditionalServicesForm: lazy(() => import('./additional-services-form').then(mod => ({ default: mod.AdditionalServicesForm }))),
  IssuerDetailsForm: lazy(() => import('./issuer-details-form').then(mod => ({ default: mod.IssuerDetailsForm }))),
  RecipientDetailsForm: lazy(() => import('./recipient-details-form').then(mod => ({ default: mod.RecipientDetailsForm }))),
  EnergyTypeForm: lazy(() => import('./energy-type-form').then(mod => ({ default: mod.EnergyTypeForm }))),
  // Add other form components as they are created
  // etc...
};

export type FormComponentName = keyof typeof formComponents;

export * from './identification-form';
export * from './offer-basic-form';
export * from './offer-details-form';
export * from './activation-methods-form';
export * from './contact-information-form';
export * from './energy-price-references-form';
export * from './offer-validity-form';
export * from './offer-characteristics-form';
export * from './dual-offers-form';
export * from './payment-methods-form';
export * from './regulated-components-form';
export * from './time-bands-form';
export * from './company-components-form';
export * from './contractual-conditions-form';
export * from './offer-zones-form';
export * from './discounts-form';
export * from './additional-services-form';
export * from './energy-type-form';
export { OfferValidityForm } from './offer-validity-form';
export { EnergyPriceReferencesForm } from './energy-price-references-form';
export { OfferDetailsForm } from './offer-details-form';
export { PaymentMethodsForm } from './payment-methods-form';
export { RegulatedComponentsForm } from './regulated-components-form';
export { TimeBandsForm } from './time-bands-form';
export { CompanyComponentsForm } from './company-components-form';
export { ContractualConditionsForm } from './contractual-conditions-form';
export { OfferZonesForm } from './offer-zones-form';
export { DiscountsForm } from './discounts-form';
export { AdditionalServicesForm } from './additional-services-form';
export { EnergyTypeForm } from './energy-type-form'; 