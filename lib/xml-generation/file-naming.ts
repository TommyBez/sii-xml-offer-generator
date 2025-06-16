import { XMLFormatter } from "./xml-formatter";
import { FileNameError } from "./errors";

export interface FileNameParams {
  pivaUtente: string;
  azione: "INSERIMENTO" | "AGGIORNAMENTO";
  descrizione: string;
}

export class FileNamingService {
  private formatter: XMLFormatter;

  constructor() {
    this.formatter = new XMLFormatter();
  }

  /**
   * Generate SII-compliant file name
   * Format: {PIVA_UTENTE}_{AZIONE}_{DESCRIZIONE}.XML
   */
  generateFileName(params: FileNameParams): string {
    // Validate PIVA format
    if (!this.formatter.validatePIVA(params.pivaUtente)) {
      throw new FileNameError(
        "Invalid PIVA format. Must be 16 alphanumeric characters.",
        params.pivaUtente
      );
    }

    // Clean and validate description
    const cleanDescription = this.formatter.cleanDescription(params.descrizione);
    
    if (!cleanDescription) {
      throw new FileNameError(
        "Description must contain at least one alphanumeric character.",
        params.pivaUtente,
        params.descrizione
      );
    }

    return `${params.pivaUtente}_${params.azione}_${cleanDescription}.XML`;
  }

  /**
   * Generate file name with timestamp for uniqueness
   */
  generateUniqueFileName(params: FileNameParams): string {
    const baseFileName = this.generateFileName(params);
    const timestamp = new Date().getTime();
    
    // Insert timestamp before .XML extension
    return baseFileName.replace('.XML', `_${timestamp}.XML`);
  }

  /**
   * Parse file name back to its components
   */
  parseFileName(fileName: string): FileNameParams | null {
    const match = fileName.match(/^([A-Z0-9]{16})_(INSERIMENTO|AGGIORNAMENTO)_([A-Z0-9]+)(_\d+)?\.XML$/);
    
    if (!match) {
      return null;
    }

    return {
      pivaUtente: match[1],
      azione: match[2] as "INSERIMENTO" | "AGGIORNAMENTO",
      descrizione: match[3]
    };
  }
} 