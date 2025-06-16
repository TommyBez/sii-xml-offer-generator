import { z, ZodError, ZodSchema } from 'zod';
import { WizardFormData } from '@/store/wizard-store';

// Validation types
export interface ValidationContext {
  formData: Partial<WizardFormData>;
  marketType?: string;
  offerType?: string;
  action: 'INSERIMENTO' | 'AGGIORNAMENTO';
}

export interface ValidationError {
  field: string;
  message: string;
  path?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export type FieldValidator = (value: any, context: ValidationContext) => ValidationError | null;
export type CrossFieldValidator = (context: ValidationContext) => ValidationError | null;
export type SectionValidator = (sectionData: any, context: ValidationContext) => ValidationError[] | null;
export type GlobalValidator = (context: ValidationContext) => ValidationError[] | null;

// Validation Registry
class ValidationRegistry {
  private fieldValidators = new Map<string, FieldValidator>();
  private crossFieldValidators = new Map<string, CrossFieldValidator>();
  private sectionValidators = new Map<string, SectionValidator>();
  private globalValidators: GlobalValidator[] = [];
  private memoizedSchemas = new Map<string, ZodSchema>();

  registerFieldValidator(fieldPath: string, validator: FieldValidator) {
    this.fieldValidators.set(fieldPath, validator);
  }

  registerCrossFieldValidator(name: string, validator: CrossFieldValidator) {
    this.crossFieldValidators.set(name, validator);
  }

  registerSectionValidator(sectionName: string, validator: SectionValidator) {
    this.sectionValidators.set(sectionName, validator);
  }

  registerGlobalValidator(validator: GlobalValidator) {
    this.globalValidators.push(validator);
  }

  getFieldValidator(fieldPath: string): FieldValidator | undefined {
    return this.fieldValidators.get(fieldPath);
  }

  getCrossFieldValidators(): Map<string, CrossFieldValidator> {
    return this.crossFieldValidators;
  }

  getSectionValidators(): Map<string, SectionValidator> {
    return this.sectionValidators;
  }

  getGlobalValidators(): GlobalValidator[] {
    return this.globalValidators;
  }

  // Schema memoization for performance
  getSchema(key: string, factory: () => ZodSchema): ZodSchema {
    if (!this.memoizedSchemas.has(key)) {
      this.memoizedSchemas.set(key, factory());
    }
    return this.memoizedSchemas.get(key)!;
  }

  clearSchemaCache() {
    this.memoizedSchemas.clear();
  }
}

export const validationRegistry = new ValidationRegistry(); 