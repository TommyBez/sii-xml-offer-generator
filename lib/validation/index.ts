// Export validation types
export * from './validation-registry';

// Export validators
export * from './base-validators';
export * from './cross-field-validators';
export * from './section-validators';

// Export validation runner
export * from './validation-runner';

// Initialize validators on import
import { initializeValidators } from './validation-runner';
initializeValidators(); 