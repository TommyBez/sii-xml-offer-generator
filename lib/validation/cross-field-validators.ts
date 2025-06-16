import { 
  ValidationContext, 
  ValidationError, 
  CrossFieldValidator 
} from './validation-registry';

// Cross-field validation rules
export const crossFieldValidators: Record<string, CrossFieldValidator> = {
  // OFFERTA_SINGOLA required for non-dual offers
  offertaSingola: (context: ValidationContext): ValidationError | null => {
    const marketType = context.formData.offerDetails?.TIPO_MERCATO;
    const offertaSingola = context.formData.offerDetails?.OFFERTA_SINGOLA;
    
    if (marketType && marketType !== "03" && !offertaSingola) {
      return {
        field: "OFFERTA_SINGOLA",
        message: "Single offer selection required for non-dual fuel offers",
        path: ["offerDetails", "OFFERTA_SINGOLA"]
      };
    }
    return null;
  },

  // Price references required for variable offers
  priceReferences: (context: ValidationContext): ValidationError | null => {
    const offerType = context.formData.offerDetails?.TIPO_OFFERTA;
    const priceIndex = context.formData.energyPriceReferences?.IDX_PREZZO_ENERGIA;
    
    if (offerType === "02") {
      // Check if there's a regulated discount (type 04)
      const discounts = context.formData.discounts;
      if (discounts && Array.isArray(discounts)) {
        const hasRegulatedDiscount = discounts.some((discount: any) => 
          discount.PREZZISconto?.some((p: any) => p.TIPOLOGIA === "04")
        );
        
        if (!hasRegulatedDiscount && !priceIndex) {
          return {
            field: "IDX_PREZZO_ENERGIA",
            message: "Price index required for variable offers without regulated discount",
            path: ["energyPriceReferences", "IDX_PREZZO_ENERGIA"]
          };
        }
      } else if (!priceIndex) {
        return {
          field: "IDX_PREZZO_ENERGIA",
          message: "Price index required for variable offers",
          path: ["energyPriceReferences", "IDX_PREZZO_ENERGIA"]
        };
      }
    }
    return null;
  },

  // Consumption limits for FLAT offers
  flatOfferLimits: (context: ValidationContext): ValidationError | null => {
    const offerType = context.formData.offerDetails?.TIPO_OFFERTA;
    const consumoMin = context.formData.offerCharacteristics?.CONSUMO_MIN;
    const consumoMax = context.formData.offerCharacteristics?.CONSUMO_MAX;
    
    if (offerType === "03") {
      if (consumoMin === undefined || consumoMax === undefined) {
        return {
          field: "CONSUMO_MIN",
          message: "Consumption limits required for FLAT offers",
          path: ["offerCharacteristics", "CONSUMO_MIN"]
        };
      }
      
      if (consumoMax <= consumoMin) {
        return {
          field: "CONSUMO_MAX",
          message: "Maximum consumption must exceed minimum consumption",
          path: ["offerCharacteristics", "CONSUMO_MAX"]
        };
      }
    }
    return null;
  },

  // Residential condominium only for gas
  residentialCondominium: (context: ValidationContext): ValidationError | null => {
    const marketType = context.formData.offerDetails?.TIPO_MERCATO;
    const clientType = context.formData.offerDetails?.TIPO_CLIENTE;
    
    if (clientType === "03" && marketType !== "02") {
      return {
        field: "TIPO_CLIENTE",
        message: "Residential condominium is only available for gas market",
        path: ["offerDetails", "TIPO_CLIENTE"]
      };
    }
    return null;
  },

  // Power limits for electricity offers
  powerLimits: (context: ValidationContext): ValidationError | null => {
    const marketType = context.formData.offerDetails?.TIPO_MERCATO;
    const potenzaMin = context.formData.offerCharacteristics?.POTENZA_MIN;
    const potenzaMax = context.formData.offerCharacteristics?.POTENZA_MAX;
    
    if (marketType === "01" && potenzaMin !== undefined && potenzaMax !== undefined) {
      if (potenzaMax <= potenzaMin) {
        return {
          field: "POTENZA_MAX",
          message: "Maximum power must be greater than minimum power",
          path: ["offerCharacteristics", "POTENZA_MAX"]
        };
      }
    }
    return null;
  },

  // Validity period validation
  validityPeriod: (context: ValidationContext): ValidationError | null => {
    const startDate = context.formData.offerValidity?.DATA_INIZIO;
    const endDate = context.formData.offerValidity?.DATA_FINE;
    
    if (startDate && endDate) {
      const parseDate = (dateStr: string): Date => {
        const [datePart, timePart] = dateStr.split('_');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hours, minutes, seconds] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
      };
      
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      if (end <= start) {
        return {
          field: "DATA_FINE",
          message: "End date must be after start date",
          path: ["offerValidity", "DATA_FINE"]
        };
      }
    }
    return null;
  },

  // Dual offer links validation
  dualOfferLinks: (context: ValidationContext): ValidationError | null => {
    const marketType = context.formData.offerDetails?.TIPO_MERCATO;
    const dualOffers = context.formData.dualOffers;
    
    if (marketType === "03") {
      if (!dualOffers?.OFFERTE_CONGIUNTE_EE?.length) {
        return {
          field: "OFFERTE_CONGIUNTE_EE",
          message: "Electricity offer codes required for dual fuel",
          path: ["dualOffers", "OFFERTE_CONGIUNTE_EE"]
        };
      }
      
      if (!dualOffers?.OFFERTE_CONGIUNTE_GAS?.length) {
        return {
          field: "OFFERTE_CONGIUNTE_GAS",
          message: "Gas offer codes required for dual fuel",
          path: ["dualOffers", "OFFERTE_CONGIUNTE_GAS"]
        };
      }
    }
    return null;
  },

  // Other description required when "99" selected
  otherDescriptions: (context: ValidationContext): ValidationError | null => {
    // Check activation methods
    const activationMethods = context.formData.activationMethods;
    if (activationMethods?.MODALITA?.includes("99") && !activationMethods.DESCRIZIONE) {
      return {
        field: "DESCRIZIONE",
        message: "Description required when 'Other' is selected",
        path: ["activationMethods", "DESCRIZIONE"]
      };
    }

    // Check payment methods
    const paymentMethods = context.formData.paymentMethods;
    if (paymentMethods?.MODALITA_PAGAMENTO?.includes("99") && !paymentMethods.DESCRIZIONE) {
      return {
        field: "DESCRIZIONE",
        message: "Description required when 'Other' is selected",
        path: ["paymentMethods", "DESCRIZIONE"]
      };
    }

    // Check energy price references
    const priceReferences = context.formData.energyPriceReferences;
    if (priceReferences?.IDX_PREZZO_ENERGIA === "99" && !priceReferences.ALTRO) {
      return {
        field: "ALTRO",
        message: "Description required for custom index",
        path: ["energyPriceReferences", "ALTRO"]
      };
    }

    return null;
  },
};

// Register all cross-field validators
export const registerCrossFieldValidators = (registry: any) => {
  Object.entries(crossFieldValidators).forEach(([name, validator]) => {
    registry.registerCrossFieldValidator(name, validator);
  });
}; 