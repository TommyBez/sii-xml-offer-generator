# Task 01 - Step Definitions Audit Summary

## Overview
This document summarizes the audit and finalization of step definitions for the Stepperize migration.

## Step Definitions Comparison

### Steps Retained (21 steps)
These steps have both forms and schemas and are included in `lib/stepper.ts`:

1. **identification** - Identification Information
2. **offer-basic** - Basic Information
3. **offer-details** - Offer Details
4. **offer-characteristics** - Offer Characteristics
5. **activation-methods** - Activation Methods
6. **contact-information** - Contact Information
7. **offer-validity** - Offer Validity Period
8. **payment-methods** - Payment Methods
9. **regulated-components** - Regulated Components
10. **energy-price-references** - Energy Price References
11. **time-bands** - Price Type & Time Bands
12. **dual-offers** - Dual Fuel Offer
13. **contractual-conditions** - Contractual Conditions
14. **offer-zones** - Offer Zones
15. **issuer-details** - Issuer Details
16. **recipient-details** - Recipient Details
17. **energy-type** - Energy Type
18. **consumption-profile** - Consumption Profile
19. **discounts** - Discounts & Promotions
20. **additional-services** - Additional Products & Services
21. **company-components** - Company Components (newly added)

### Steps Removed (12 steps)
These steps were in `wizard-config.ts` but have no corresponding forms:

1. **pricing-structure** - No form component exists
2. **contract-duration** - No form component exists
3. **green-energy** - No form component exists
4. **network-costs** - No form component exists
5. **taxes-fees** - No form component exists
6. **payment-terms** - No form component exists
7. **meter-reading** - No form component exists
8. **connection-details** - No form component exists
9. **service-level** - No form component exists
10. **special-conditions** - No form component exists
11. **regulatory-compliance** - No form component exists
12. **summary-review** - No form component exists

### New Additions
- **company-components** - This step has a form (`company-components-form.tsx`) but was missing from `wizard-config.ts`

## Schema Status

### Schemas Added to `schemas/index.ts`:
1. **offerBasicSchema** - Moved from form component
2. **timeBandsSchema** - Created based on SII requirements
3. **dualOffersSchema** - Created based on SII requirements
4. **contractualConditionsSchema** - Created based on SII requirements
5. **consumptionProfileSchema** - Created based on SII requirements
6. **companyComponentsSchema** - Created based on SII requirements

### Schemas Already Present:
- identificationSchema
- offerDetailsSchema
- offerCharacteristicsSchema
- activationMethodsSchema
- contactInformationSchema
- energyPriceReferencesSchema
- offerValiditySchema
- paymentMethodsSchema
- regulatedComponentsSchema
- offerZonesSchema
- discountsSchema
- additionalServicesSchema
- issuerDetailsSchema
- recipientDetailsSchema
- energyTypeSchema

## Changes Made

1. **Created `lib/stepper.ts`** with Stepperize definition including all 21 steps that have forms
2. **Updated `schemas/index.ts`** to include all missing schemas
3. **Fixed TypeScript export** for `StepId` type using proper Stepperize API

## Type Safety
The `StepId` type is now properly exported as:
```typescript
export type StepId = Parameters<ReturnType<typeof useStepper>['get']>[0];
```

This creates a union type of all step IDs for type-safe navigation.

## Next Steps
- Update form components to use schemas from `schemas/index.ts` instead of local definitions
- Update navigation components to use the new stepper definition
- Remove dependencies on `wizard-config.ts` 