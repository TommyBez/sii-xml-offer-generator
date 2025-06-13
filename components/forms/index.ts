// Form component registry for dynamic imports
import { lazy } from 'react';

export const formComponents = {
  OfferBasicForm: lazy(() => import('./offer-basic-form').then(mod => ({ default: mod.OfferBasicForm }))),
  IdentificationForm: lazy(() => import('./identification-form').then(mod => ({ default: mod.IdentificationForm }))),
  OfferDetailsForm: lazy(() => import('./offer-details-form').then(mod => ({ default: mod.OfferDetailsForm }))),
  ActivationMethodsForm: lazy(() => import('./activation-methods-form').then(mod => ({ default: mod.ActivationMethodsForm }))),
  ContactInformationForm: lazy(() => import('./contact-information-form').then(mod => ({ default: mod.ContactInformationForm }))),
  EnergyPriceReferencesForm: lazy(() => import('./energy-price-references-form').then(mod => ({ default: mod.EnergyPriceReferencesForm }))),
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