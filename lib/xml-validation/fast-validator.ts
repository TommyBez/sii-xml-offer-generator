import { XMLValidator, XMLParser } from "fast-xml-parser";

// Helper function to get value by path in nested object
function getValueByPath(obj: any, path: string): any {
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

// Fast validation options
const parserOptions = {
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  parseAttributeValue: true,
  trimValues: true,
  parseTrueNumberOnly: true
};

export const fastValidator = {
  // Check if XML structure is valid
  checkStructure: (xml: string): boolean => {
    try {
      const result = XMLValidator.validate(xml, parserOptions);
      return result === true;
    } catch (error) {
      return false;
    }
  },

  // Get structure validation errors
  getStructureErrors: (xml: string): string[] => {
    try {
      const result = XMLValidator.validate(xml, parserOptions);
      if (result === true) {
        return [];
      }
      
      // Handle validation error object
      if (typeof result === "object" && result.err) {
        return [`Line ${result.err.line}: ${result.err.msg}`];
      }
      
      return ["Invalid XML structure"];
    } catch (error) {
      return [`Parse error: ${error instanceof Error ? error.message : String(error)}`];
    }
  },

  // Check required elements according to SII specification
  checkRequiredElements: (xml: string): string[] => {
    try {
      const parser = new XMLParser(parserOptions);
      const parsedXml = parser.parse(xml);
      const missingElements: string[] = [];
      
      // Required paths based on XSD
      const requiredPaths = [
        "Offerta.IdentificativiOfferta",
        "Offerta.IdentificativiOfferta.PIVA_UTENTE",
        "Offerta.IdentificativiOfferta.COD_OFFERTA",
        "Offerta.DettaglioOfferta",
        "Offerta.DettaglioOfferta.TIPO_MERCATO",
        "Offerta.DettaglioOfferta.TIPO_CLIENTE",
        "Offerta.DettaglioOfferta.TIPO_OFFERTA",
        "Offerta.DettaglioOfferta.TIPOLOGIA_ATT_CONTR",
        "Offerta.DettaglioOfferta.NOME_OFFERTA",
        "Offerta.DettaglioOfferta.DESCRIZIONE",
        "Offerta.DettaglioOfferta.DURATA",
        "Offerta.DettaglioOfferta.GARANZIE",
        "Offerta.DettaglioOfferta.ModalitaAttivazione",
        "Offerta.DettaglioOfferta.ModalitaAttivazione.MODALITA",
        "Offerta.DettaglioOfferta.Contatti",
        "Offerta.DettaglioOfferta.Contatti.TELEFONO",
        "Offerta.ValiditaOfferta",
        "Offerta.ValiditaOfferta.DATA_INIZIO",
        "Offerta.ValiditaOfferta.DATA_FINE",
        "Offerta.MetodoPagamento",
        "Offerta.MetodoPagamento.MODALITA_PAGAMENTO"
      ];

      requiredPaths.forEach((path) => {
        if (!getValueByPath(parsedXml, path)) {
          missingElements.push(path);
        }
      });

      return missingElements;
    } catch (error) {
      return [`Failed to parse XML: ${error instanceof Error ? error.message : String(error)}`];
    }
  },

  // Validate date format (DD/MM/YYYY_HH:MM:SS)
  validateDateFormat: (dateStr: string): boolean => {
    const pattern = /^\d{2}\/\d{2}\/\d{4}_\d{2}:\d{2}:\d{2}$/;
    return pattern.test(dateStr);
  },

  // Validate enumerations
  validateEnumeration: (value: string, allowedValues: string[]): boolean => {
    return allowedValues.includes(value);
  },

  // Extract and validate specific fields
  validateFields: (xml: string): { field: string; value: string; error?: string }[] => {
    const errors: { field: string; value: string; error?: string }[] = [];
    
    try {
      const parser = new XMLParser(parserOptions);
      const parsedXml = parser.parse(xml);
      
      // Validate TIPO_MERCATO
      const tipoMercato = getValueByPath(parsedXml, "Offerta.DettaglioOfferta.TIPO_MERCATO");
      if (tipoMercato && !fastValidator.validateEnumeration(tipoMercato, ["01", "02", "03"])) {
        errors.push({
          field: "TIPO_MERCATO",
          value: tipoMercato,
          error: "Must be 01 (Elettrico), 02 (Gas), or 03 (Dual Fuel)"
        });
      }
      
      // Validate TIPO_CLIENTE
      const tipoCliente = getValueByPath(parsedXml, "Offerta.DettaglioOfferta.TIPO_CLIENTE");
      if (tipoCliente && !fastValidator.validateEnumeration(tipoCliente, ["01", "02", "03"])) {
        errors.push({
          field: "TIPO_CLIENTE",
          value: tipoCliente,
          error: "Must be 01 (Domestico), 02 (Altri Usi), or 03 (Condominio Uso Domestico)"
        });
      }
      
      // Validate dates
      const dataInizio = getValueByPath(parsedXml, "Offerta.ValiditaOfferta.DATA_INIZIO");
      if (dataInizio && !fastValidator.validateDateFormat(dataInizio)) {
        errors.push({
          field: "DATA_INIZIO",
          value: dataInizio,
          error: "Must be in format DD/MM/YYYY_HH:MM:SS"
        });
      }
      
      const dataFine = getValueByPath(parsedXml, "Offerta.ValiditaOfferta.DATA_FINE");
      if (dataFine && !fastValidator.validateDateFormat(dataFine)) {
        errors.push({
          field: "DATA_FINE",
          value: dataFine,
          error: "Must be in format DD/MM/YYYY_HH:MM:SS"
        });
      }
      
      return errors;
    } catch (error) {
      return [{
        field: "XML",
        value: "",
        error: `Failed to parse: ${error instanceof Error ? error.message : String(error)}`
      }];
    }
  }
}; 