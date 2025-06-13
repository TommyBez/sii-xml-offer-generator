// Form component registry for dynamic imports
import { lazy } from 'react';

export const formComponents = {
  OfferBasicForm: lazy(() => import('./offer-basic-form').then(mod => ({ default: mod.OfferBasicForm }))),
  // Add other form components as they are created
  // IssuerDetailsForm: lazy(() => import('./issuer-details-form').then(mod => ({ default: mod.IssuerDetailsForm }))),
  // RecipientDetailsForm: lazy(() => import('./recipient-details-form').then(mod => ({ default: mod.RecipientDetailsForm }))),
  // etc...
};

export type FormComponentName = keyof typeof formComponents; 