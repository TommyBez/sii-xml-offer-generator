import { z, ZodError } from 'zod';
import { 
  ValidationContext, 
  ValidationError, 
  ValidationResult,
  validationRegistry 
} from './validation-registry';
import { WizardFormData } from '@/store/wizard-store';
import * as schemas from '@/schemas';
import { registerCrossFieldValidators } from './cross-field-validators';
import { registerSectionValidators } from './section-validators';

// Initialize validators
export const initializeValidators = () => {
  registerCrossFieldValidators(validationRegistry);
  registerSectionValidators(validationRegistry);
};

// Run schema validation for a section
const runSchemaValidation = async (
  sectionName: string, 
  data: any,
  schemaName: string
): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];
  
  try {
    // Get schema from schemas module
    const schema = (schemas as any)[schemaName];
    if (!schema) {
      console.warn(`Schema ${schemaName} not found`);
      return errors;
    }

    const result = await schema.safeParseAsync(data);
    
    if (!result.success) {
      result.error.errors.forEach((error) => {
        errors.push({
          field: error.path.join('.'),
          message: error.message,
          path: [sectionName, ...error.path.map(String)]
        });
      });
    }
  } catch (error) {
    console.error(`Error validating section ${sectionName}:`, error);
  }
  
  return errors;
};

// Run field validators
const runFieldValidators = (context: ValidationContext): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  // Iterate through form data sections
  Object.entries(context.formData).forEach(([section, sectionData]) => {
    if (!sectionData || typeof sectionData !== 'object') return;
    
    // Check each field in the section
    Object.entries(sectionData).forEach(([field, value]) => {
      const fieldPath = `${section}.${field}`;
      const validator = validationRegistry.getFieldValidator(fieldPath);
      
      if (validator) {
        const error = validator(value, context);
        if (error) {
          errors.push(error);
        }
      }
    });
  });
  
  return errors;
};

// Run cross-field validators
const runCrossFieldValidators = (context: ValidationContext): ValidationError[] => {
  const errors: ValidationError[] = [];
  const validators = validationRegistry.getCrossFieldValidators();
  
  validators.forEach((validator, name) => {
    try {
      const error = validator(context);
      if (error) {
        errors.push(error);
      }
    } catch (err) {
      console.error(`Error running cross-field validator ${name}:`, err);
    }
  });
  
  return errors;
};

// Run section validators
const runSectionValidators = (context: ValidationContext): ValidationError[] => {
  const errors: ValidationError[] = [];
  const validators = validationRegistry.getSectionValidators();
  
  validators.forEach((validator, sectionName) => {
    const sectionData = (context.formData as any)[sectionName];
    if (sectionData) {
      try {
        const sectionErrors = validator(sectionData, context);
        if (sectionErrors) {
          errors.push(...sectionErrors);
        }
      } catch (err) {
        console.error(`Error running section validator ${sectionName}:`, err);
      }
    }
  });
  
  return errors;
};

// Run global validators
const runGlobalValidators = (context: ValidationContext): ValidationError[] => {
  const errors: ValidationError[] = [];
  const validators = validationRegistry.getGlobalValidators();
  
  validators.forEach((validator, index) => {
    try {
      const globalErrors = validator(context);
      if (globalErrors) {
        errors.push(...globalErrors);
      }
    } catch (err) {
      console.error(`Error running global validator ${index}:`, err);
    }
  });
  
  return errors;
};

// Main validation runner
export const runValidation = async (
  formData: Partial<WizardFormData>,
  action: 'INSERIMENTO' | 'AGGIORNAMENTO' = 'INSERIMENTO'
): Promise<ValidationResult> => {
  // Initialize validators if not already done
  if (validationRegistry.getCrossFieldValidators().size === 0) {
    initializeValidators();
  }

  const context: ValidationContext = {
    formData,
    marketType: formData.offerDetails?.TIPO_MERCATO,
    offerType: formData.offerDetails?.TIPO_OFFERTA,
    action
  };

  const allErrors: ValidationError[] = [];
  
  // Run schema validations for each section
  const schemaValidationPromises: Promise<ValidationError[]>[] = [];
  
  if (formData.identification) {
    schemaValidationPromises.push(
      runSchemaValidation('identification', formData.identification, 'identificationSchema')
    );
  }
  
  if (formData.offerDetails) {
    schemaValidationPromises.push(
      runSchemaValidation('offerDetails', formData.offerDetails, 'offerDetailsSchema')
    );
  }
  
  if (formData.activationMethods) {
    schemaValidationPromises.push(
      runSchemaValidation('activationMethods', formData.activationMethods, 'activationMethodsSchema')
    );
  }
  
  if (formData.contactInformation) {
    schemaValidationPromises.push(
      runSchemaValidation('contactInformation', formData.contactInformation, 'contactInformationSchema')
    );
  }
  
  if (formData.energyPriceReferences) {
    schemaValidationPromises.push(
      runSchemaValidation('energyPriceReferences', formData.energyPriceReferences, 'energyPriceReferencesSchema')
    );
  }
  
  if (formData.offerValidity) {
    schemaValidationPromises.push(
      runSchemaValidation('offerValidity', formData.offerValidity, 'offerValiditySchema')
    );
  }
  
  if (formData.offerCharacteristics) {
    schemaValidationPromises.push(
      runSchemaValidation('offerCharacteristics', formData.offerCharacteristics, 'offerCharacteristicsSchema')
    );
  }
  
  if (formData.paymentMethods) {
    schemaValidationPromises.push(
      runSchemaValidation('paymentMethods', formData.paymentMethods, 'paymentMethodsSchema')
    );
  }
  
  if (formData.regulatedComponents) {
    schemaValidationPromises.push(
      runSchemaValidation('regulatedComponents', formData.regulatedComponents, 'regulatedComponentsSchema')
    );
  }
  
  if (formData.offerZones) {
    schemaValidationPromises.push(
      runSchemaValidation('offerZones', formData.offerZones, 'offerZonesSchema')
    );
  }
  
  if (formData.discounts) {
    schemaValidationPromises.push(
      runSchemaValidation('discounts', formData.discounts, 'discountsSchema')
    );
  }
  
  if (formData.additionalServices) {
    schemaValidationPromises.push(
      runSchemaValidation('additionalServices', formData.additionalServices, 'additionalServicesSchema')
    );
  }

  // Wait for all schema validations to complete
  const schemaValidationResults = await Promise.all(schemaValidationPromises);
  schemaValidationResults.forEach(errors => allErrors.push(...errors));
  
  // Run other validation types
  allErrors.push(...runFieldValidators(context));
  allErrors.push(...runCrossFieldValidators(context));
  allErrors.push(...runSectionValidators(context));
  allErrors.push(...runGlobalValidators(context));
  
  // Deduplicate errors by field and message
  const uniqueErrors = Array.from(
    new Map(
      allErrors.map(error => [`${error.field}-${error.message}`, error])
    ).values()
  );
  
  return {
    isValid: uniqueErrors.length === 0,
    errors: uniqueErrors
  };
};

// Validate a single section
export const validateSection = async (
  sectionName: string,
  sectionData: any,
  formData: Partial<WizardFormData>,
  schemaName?: string
): Promise<ValidationResult> => {
  const context: ValidationContext = {
    formData,
    marketType: formData.offerDetails?.TIPO_MERCATO,
    offerType: formData.offerDetails?.TIPO_OFFERTA,
    action: 'INSERIMENTO'
  };

  const errors: ValidationError[] = [];
  
  // Run schema validation if schema name provided
  if (schemaName) {
    const schemaErrors = await runSchemaValidation(sectionName, sectionData, schemaName);
    errors.push(...schemaErrors);
  }
  
  // Run section validator if exists
  const sectionValidator = validationRegistry.getSectionValidators().get(sectionName);
  if (sectionValidator) {
    const sectionErrors = sectionValidator(sectionData, context);
    if (sectionErrors) {
      errors.push(...sectionErrors);
    }
  }
  
  // Run relevant cross-field validators
  const crossFieldErrors = runCrossFieldValidators(context);
  // Filter to only errors related to this section
  const relevantCrossFieldErrors = crossFieldErrors.filter(error => 
    error.path && error.path[0] === sectionName
  );
  errors.push(...relevantCrossFieldErrors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Group errors by section for display
export const groupErrorsBySection = (errors: ValidationError[]): Record<string, ValidationError[]> => {
  const grouped: Record<string, ValidationError[]> = {};
  
  errors.forEach(error => {
    const section = error.path ? error.path[0] : 'general';
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(error);
  });
  
  return grouped;
}; 