import { useEffect, useState, useMemo, useCallback } from 'react';
import { useWizardStore } from '@/store/wizard-store';
import { 
  ValidationError, 
  ValidationResult 
} from '@/lib/validation/validation-registry';
import { runValidation, validateSection, groupErrorsBySection } from '@/lib/validation/validation-runner';
import { debounce } from 'lodash';

export interface UseFormValidationOptions {
  debounceMs?: number;
  validateOnMount?: boolean;
  sectionName?: string;
  schemaName?: string;
}

export interface UseFormValidationResult {
  errors: ValidationError[];
  errorsByField: Record<string, string>;
  errorsBySection: Record<string, ValidationError[]>;
  isValid: boolean;
  isValidating: boolean;
  validate: () => Promise<void>;
  validateField: (fieldPath: string, value: any) => Promise<void>;
  clearErrors: () => void;
}

export const useFormValidation = (
  options: UseFormValidationOptions = {}
): UseFormValidationResult => {
  const {
    debounceMs = 300,
    validateOnMount = true,
    sectionName,
    schemaName
  } = options;

  const formData = useWizardStore((state) => state.formData);
  const setValidationErrors = useWizardStore((state) => state.setValidationErrors);
  const clearValidationErrors = useWizardStore((state) => state.clearValidationErrors);

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Create debounced validation function
  const debouncedValidation = useMemo(
    () =>
      debounce(async (data: any) => {
        setIsValidating(true);
        
        try {
          let result: ValidationResult;
          
          if (sectionName && data[sectionName]) {
            // Validate specific section
            result = await validateSection(
              sectionName,
              data[sectionName],
              data,
              schemaName
            );
          } else {
            // Validate entire form
            result = await runValidation(data);
          }
          
          setErrors(result.errors);
          
          // Update store with validation errors
          const errorsBySection = groupErrorsBySection(result.errors);
          
          if (sectionName) {
            // Update only this section's errors
            setValidationErrors(sectionName, 
              errorsBySection[sectionName]?.reduce((acc, error) => {
                acc[error.field] = error.message;
                return acc;
              }, {} as Record<string, string>) || {}
            );
          } else {
            // Update all sections' errors
            Object.entries(errorsBySection).forEach(([section, sectionErrors]) => {
              setValidationErrors(section, 
                sectionErrors.reduce((acc, error) => {
                  acc[error.field] = error.message;
                  return acc;
                }, {} as Record<string, string>)
              );
            });
          }
        } catch (error) {
          console.error('Validation error:', error);
        } finally {
          setIsValidating(false);
        }
      }, debounceMs),
    [debounceMs, sectionName, schemaName, setValidationErrors]
  );

  // Run validation when form data changes
  useEffect(() => {
    if (validateOnMount || Object.keys(formData).length > 0) {
      debouncedValidation(formData);
    }
    
    // Cleanup
    return () => {
      debouncedValidation.cancel();
    };
  }, [formData, debouncedValidation, validateOnMount]);

  // Manual validation trigger
  const validate = useCallback(async () => {
    debouncedValidation.cancel();
    await debouncedValidation(formData);
  }, [formData, debouncedValidation]);

  // Validate single field
  const validateField = useCallback(async (fieldPath: string, value: any) => {
    const [section, field] = fieldPath.split('.');
    
    if (!section || !field) {
      console.warn(`Invalid field path: ${fieldPath}`);
      return;
    }

    // Create temporary form data with updated field
    const tempFormData = {
      ...formData,
      [section]: {
        ...(formData as any)[section],
        [field]: value
      }
    };

    // Run validation with updated data
    await debouncedValidation(tempFormData);
  }, [formData, debouncedValidation]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
    if (sectionName) {
      clearValidationErrors(sectionName);
    } else {
      clearValidationErrors();
    }
  }, [sectionName, clearValidationErrors]);

  // Compute derived state
  const errorsByField = useMemo(() => {
    return errors.reduce((acc, error) => {
      const fieldKey = error.path ? error.path.join('.') : error.field;
      acc[fieldKey] = error.message;
      return acc;
    }, {} as Record<string, string>);
  }, [errors]);

  const errorsBySection = useMemo(() => {
    return groupErrorsBySection(errors);
  }, [errors]);

  const isValid = errors.length === 0;

  return {
    errors,
    errorsByField,
    errorsBySection,
    isValid,
    isValidating,
    validate,
    validateField,
    clearErrors
  };
};

// Hook for field-level validation
export const useFieldValidation = (
  fieldPath: string,
  options?: UseFormValidationOptions
) => {
  const [section, field] = fieldPath.split('.');
  const value = useWizardStore((state) => 
    (state.formData as any)[section]?.[field]
  );
  
  const validation = useFormValidation({
    ...options,
    sectionName: section
  });

  const fieldError = validation.errorsByField[fieldPath];

  return {
    value,
    error: fieldError,
    isValid: !fieldError,
    validate: () => validation.validateField(fieldPath, value)
  };
}; 