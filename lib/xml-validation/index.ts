// Export all XML validation utilities

// Use simple validator by default (no native dependencies)
export { SimpleXSDValidator as XSDValidator, getDefaultValidator } from "./simple-xsd-validator";
export type { ValidationError, ValidationResult } from "./simple-xsd-validator";

export { fastValidator } from "./fast-validator";

export {
  enhanceXSDErrors,
  mapXPathToFormField,
  formatErrorForDisplay,
  groupErrorsByField,
  getErrorSeverity,
  summarizeErrors
} from "./error-enhancer";
export type { EnhancedError } from "./error-enhancer";

// Export generated types
export * from "../../types/sii-generated"; 