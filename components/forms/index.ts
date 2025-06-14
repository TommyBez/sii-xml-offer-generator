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
  // Add other form components as they are created
  // IssuerDetailsForm: lazy(() => import('./issuer-details-form').then(mod => ({ default: mod.IssuerDetailsForm }))),
  // RecipientDetailsForm: lazy(() => import('./recipient-details-form').then(mod => ({ default: mod.RecipientDetailsForm }))),
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
export { OfferValidityForm } from './offer-validity-form';
export { EnergyPriceReferencesForm } from './energy-price-references-form';
export { OfferDetailsForm } from './offer-details-form';
export { PaymentMethodsForm } from './payment-methods-form';
export { RegulatedComponentsForm } from './regulated-components-form'; 