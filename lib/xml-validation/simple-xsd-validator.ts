import { XMLParser, XMLValidator } from "fast-xml-parser";
import { readFileSync } from "fs";
import { join } from "path";
import { SIIOfferta } from "../../types/sii-generated";

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  level: string;
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Schema-based validation rules
const validationRules = {
  // Required sections
  requiredSections: [
    "IdentificativiOfferta",
    "DettaglioOfferta",
    "DettaglioOfferta.ModalitaAttivazione",
    "DettaglioOfferta.Contatti",
    "ValiditaOfferta",
    "MetodoPagamento"
  ],
  
  // Field constraints
  fieldConstraints: {
    "IdentificativiOfferta.PIVA_UTENTE": { maxLength: 16, required: true },
    "IdentificativiOfferta.COD_OFFERTA": { maxLength: 32, required: true },
    "DettaglioOfferta.NOME_OFFERTA": { maxLength: 255, required: true },
    "DettaglioOfferta.DESCRIZIONE": { maxLength: 3000, required: true },
    "DettaglioOfferta.DURATA": { min: -1, max: 99, required: true },
    "DettaglioOfferta.GARANZIE": { maxLength: 3000, required: true },
    "DettaglioOfferta.Contatti.TELEFONO": { maxLength: 15, required: true },
    "DettaglioOfferta.Contatti.URL_SITO_VENDITORE": { maxLength: 100, required: false },
    "DettaglioOfferta.Contatti.URL_OFFERTA": { maxLength: 100, required: false },
  },
  
  // Date format pattern
  datePattern: /^\d{2}\/\d{2}\/\d{4}_\d{2}:\d{2}:\d{2}$/,
  
  // Enum validations
  enums: {
    TIPO_MERCATO: ["01", "02", "03"],
    TIPO_CLIENTE: ["01", "02", "03"],
    TIPO_OFFERTA: ["01", "02", "03"],
    TIPOLOGIA_ATT_CONTR: ["01", "02", "03", "04", "99"],
    MODALITA_PAGAMENTO: ["01", "02", "03", "04", "99"],
    MODALITA: ["01", "02", "03", "04", "05", "99"],
    OFFERTA_SINGOLA: ["SI", "NO"],
    DOMESTICO_RESIDENTE: ["01", "02", "03"],
  }
};

export class SimpleXSDValidator {
  private xsdPath: string;

  constructor(xsdPath?: string) {
    this.xsdPath = xsdPath || join(process.cwd(), "docs", "xml-schema.xsd");
  }

  validateXML(xmlString: string): ValidationResult {
    const errors: ValidationError[] = [];

    // First, check if XML is well-formed
    const validationResult = XMLValidator.validate(xmlString, {
      allowBooleanAttributes: true,
      ignoreAttributes: false
    });

    if (validationResult !== true) {
      errors.push({
        line: validationResult.err?.line,
        column: validationResult.err?.col,
        message: validationResult.err?.msg || "Invalid XML structure",
        level: "fatal"
      });
      return { valid: false, errors };
    }

    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      trimValues: true,
      parseAttributeValue: true
    });

    let parsedXml: any;
    try {
      parsedXml = parser.parse(xmlString);
    } catch (error) {
      errors.push({
        message: `Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`,
        level: "fatal"
      });
      return { valid: false, errors };
    }

    // Validate against schema rules
    this.validateStructure(parsedXml, errors);
    this.validateFieldConstraints(parsedXml, errors);
    this.validateEnumerations(parsedXml, errors);
    this.validateDates(parsedXml, errors);

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateStructure(xml: any, errors: ValidationError[]): void {
    if (!xml.Offerta) {
      errors.push({
        message: "Root element must be 'Offerta'",
        level: "error",
        path: "Offerta"
      });
      return;
    }

    // Check required sections
    validationRules.requiredSections.forEach(section => {
      const value = this.getValueByPath(xml.Offerta, section);
      if (value === undefined || value === null) {
        errors.push({
          message: `Required section '${section}' is missing`,
          level: "error",
          path: `Offerta.${section}`
        });
      }
    });
  }

  private validateFieldConstraints(xml: any, errors: ValidationError[]): void {
    Object.entries(validationRules.fieldConstraints).forEach(([path, constraints]) => {
      const value = this.getValueByPath(xml.Offerta, path);
      
      if (constraints.required && (value === undefined || value === null || value === "")) {
        errors.push({
          message: `Required field '${path}' is missing or empty`,
          level: "error",
          path: `Offerta.${path}`
        });
        return;
      }

      if (value !== undefined && value !== null && value !== "") {
        // Check max length
        if (constraints.maxLength && String(value).length > constraints.maxLength) {
          errors.push({
            message: `Field '${path}' exceeds maximum length of ${constraints.maxLength}`,
            level: "error",
            path: `Offerta.${path}`
          });
        }

        // Check numeric constraints
        if (constraints.min !== undefined || constraints.max !== undefined) {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            if (constraints.min !== undefined && numValue < constraints.min) {
              errors.push({
                message: `Field '${path}' value ${numValue} is less than minimum ${constraints.min}`,
                level: "error",
                path: `Offerta.${path}`
              });
            }
            if (constraints.max !== undefined && numValue > constraints.max) {
              errors.push({
                message: `Field '${path}' value ${numValue} exceeds maximum ${constraints.max}`,
                level: "error",
                path: `Offerta.${path}`
              });
            }
          }
        }
      }
    });
  }

  private validateEnumerations(xml: any, errors: ValidationError[]): void {
    Object.entries(validationRules.enums).forEach(([field, allowedValues]) => {
      const paths = this.findFieldPaths(xml.Offerta, field);
      
      paths.forEach(path => {
        const value = this.getValueByPath(xml.Offerta, path);
        if (value !== undefined && value !== null) {
          const values = Array.isArray(value) ? value : [value];
          values.forEach((val, index) => {
            if (!allowedValues.includes(String(val))) {
              const pathWithIndex = Array.isArray(value) ? `${path}[${index}]` : path;
              errors.push({
                message: `Invalid value '${val}' for field '${field}'. Allowed values: ${allowedValues.join(", ")}`,
                level: "error",
                path: `Offerta.${pathWithIndex}`
              });
            }
          });
        }
      });
    });
  }

  private validateDates(xml: any, errors: ValidationError[]): void {
    const datePaths = [
      "ValiditaOfferta.DATA_INIZIO",
      "ValiditaOfferta.DATA_FINE"
    ];

    datePaths.forEach(path => {
      const value = this.getValueByPath(xml.Offerta, path);
      if (value && !validationRules.datePattern.test(String(value))) {
        errors.push({
          message: `Invalid date format for '${path}'. Expected format: DD/MM/YYYY_HH:MM:SS`,
          level: "error",
          path: `Offerta.${path}`
        });
      }
    });
  }

  private getValueByPath(obj: any, path: string): any {
    const parts = path.split(".");
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  private findFieldPaths(obj: any, fieldName: string, currentPath: string = ""): string[] {
    const paths: string[] = [];
    
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach(key => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        
        if (key === fieldName) {
          paths.push(newPath);
        }
        
        if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
          paths.push(...this.findFieldPaths(obj[key], fieldName, newPath));
        }
      });
    }
    
    return paths;
  }

  // Validate XML file from path
  validateXMLFile(filePath: string): ValidationResult {
    try {
      const xmlContent = readFileSync(filePath, "utf-8");
      return this.validateXML(xmlContent);
    } catch (error) {
      return {
        valid: false,
        errors: [{
          message: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`,
          level: "fatal"
        }]
      };
    }
  }

  // Get schema information
  getSchemaInfo(): {
    loaded: boolean;
    path: string;
  } {
    return {
      loaded: true,
      path: this.xsdPath
    };
  }
}

// Singleton instance for convenience
let defaultValidator: SimpleXSDValidator | null = null;

export function getDefaultValidator(): SimpleXSDValidator {
  if (!defaultValidator) {
    defaultValidator = new SimpleXSDValidator();
  }
  return defaultValidator;
} 