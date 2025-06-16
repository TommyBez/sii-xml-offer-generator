import { ValidationError } from "./xsd-validator";

export interface EnhancedError extends ValidationError {
  suggestion?: string;
  formField?: string;
  userFriendlyMessage?: string;
}

// Map XML paths to form field names
const pathToFieldMap: Record<string, string> = {
  "Offerta.IdentificativiOfferta.PIVA_UTENTE": "vatNumber",
  "Offerta.IdentificativiOfferta.COD_OFFERTA": "offerCode",
  "Offerta.DettaglioOfferta.TIPO_MERCATO": "marketType",
  "Offerta.DettaglioOfferta.TIPO_CLIENTE": "customerType",
  "Offerta.DettaglioOfferta.TIPO_OFFERTA": "offerType",
  "Offerta.DettaglioOfferta.NOME_OFFERTA": "offerName",
  "Offerta.DettaglioOfferta.DESCRIZIONE": "description",
  "Offerta.DettaglioOfferta.DURATA": "duration",
  "Offerta.ValiditaOfferta.DATA_INIZIO": "startDate",
  "Offerta.ValiditaOfferta.DATA_FINE": "endDate",
  "Offerta.MetodoPagamento.MODALITA_PAGAMENTO": "paymentMethod",
};

// Common error patterns and their user-friendly messages
const errorPatterns: Array<{
  pattern: RegExp;
  message: string;
  suggestion: string;
}> = [
  {
    pattern: /element is not allowed/i,
    message: "This element is not allowed in this section",
    suggestion: "Check if this element is in the correct parent section according to the SII specification"
  },
  {
    pattern: /does not match pattern/i,
    message: "The value format is incorrect",
    suggestion: "Verify the format matches SII requirements (e.g., dates should be DD/MM/YYYY_HH:MM:SS)"
  },
  {
    pattern: /missing required element/i,
    message: "A required element is missing",
    suggestion: "Add all required elements according to the SII schema"
  },
  {
    pattern: /invalid enumeration value/i,
    message: "The selected value is not valid",
    suggestion: "Choose one of the allowed values from the dropdown"
  },
  {
    pattern: /exceeds maximum length/i,
    message: "The text is too long",
    suggestion: "Shorten the text to meet the maximum length requirement"
  },
  {
    pattern: /invalid date format/i,
    message: "The date format is incorrect",
    suggestion: "Use the format DD/MM/YYYY_HH:MM:SS (e.g., 01/01/2024_00:00:00)"
  },
  {
    pattern: /element content is invalid/i,
    message: "The content of this element is invalid",
    suggestion: "Check that all required child elements are present and properly formatted"
  }
];

export function enhanceXSDErrors(errors: ValidationError[]): EnhancedError[] {
  return errors.map((error) => {
    const enhanced: EnhancedError = { ...error };

    // Try to match error patterns
    for (const pattern of errorPatterns) {
      if (pattern.pattern.test(error.message)) {
        enhanced.userFriendlyMessage = pattern.message;
        enhanced.suggestion = pattern.suggestion;
        break;
      }
    }

    // If no pattern matched, provide a generic message
    if (!enhanced.userFriendlyMessage) {
      enhanced.userFriendlyMessage = "Validation error";
      enhanced.suggestion = "Check the XML structure and content against the SII specification";
    }

    // Map XML path to form field if available
    if (error.path) {
      enhanced.formField = mapXPathToFormField(error.path);
    }

    return enhanced;
  });
}

export function mapXPathToFormField(xpath: string): string | undefined {
  // Direct mapping
  if (pathToFieldMap[xpath]) {
    return pathToFieldMap[xpath];
  }

  // Try to extract field name from the last part of the path
  const parts = xpath.split(".");
  const lastPart = parts[parts.length - 1];
  
  // Convert XML element name to camelCase
  if (lastPart) {
    return lastPart
      .split("_")
      .map((part, index) => 
        index === 0 ? part.toLowerCase() : part.charAt(0) + part.slice(1).toLowerCase()
      )
      .join("");
  }

  return undefined;
}

export function formatErrorForDisplay(error: EnhancedError): string {
  const parts: string[] = [];

  if (error.line && error.column) {
    parts.push(`Line ${error.line}, Column ${error.column}:`);
  }

  parts.push(error.userFriendlyMessage || error.message);

  if (error.suggestion) {
    parts.push(`\nSuggestion: ${error.suggestion}`);
  }

  if (error.formField) {
    parts.push(`\nRelated field: ${error.formField}`);
  }

  return parts.join(" ");
}

export function groupErrorsByField(errors: EnhancedError[]): Map<string, EnhancedError[]> {
  const grouped = new Map<string, EnhancedError[]>();

  errors.forEach((error) => {
    const field = error.formField || "general";
    const existing = grouped.get(field) || [];
    existing.push(error);
    grouped.set(field, existing);
  });

  return grouped;
}

export function getErrorSeverity(error: EnhancedError): "error" | "warning" | "info" {
  // Map libxmljs error levels to our severity levels
  const levelMap: Record<string, "error" | "warning" | "info"> = {
    "fatal": "error",
    "error": "error",
    "warning": "warning",
    "info": "info"
  };

  return levelMap[error.level.toLowerCase()] || "error";
}

export function summarizeErrors(errors: EnhancedError[]): {
  totalErrors: number;
  errorsByType: Map<string, number>;
  criticalErrors: number;
  warnings: number;
} {
  const summary = {
    totalErrors: errors.length,
    errorsByType: new Map<string, number>(),
    criticalErrors: 0,
    warnings: 0
  };

  errors.forEach((error) => {
    const severity = getErrorSeverity(error);
    
    if (severity === "error") {
      summary.criticalErrors++;
    } else if (severity === "warning") {
      summary.warnings++;
    }

    // Count by type
    const type = error.userFriendlyMessage || "Other";
    const count = summary.errorsByType.get(type) || 0;
    summary.errorsByType.set(type, count + 1);
  });

  return summary;
} 