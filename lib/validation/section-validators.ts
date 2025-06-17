import { 
  ValidationContext, 
  ValidationError, 
  SectionValidator 
} from './validation-registry';

// Helper to get expected band count based on band type
const getExpectedBandCount = (tipologiaFasce?: string): number => {
  switch (tipologiaFasce) {
    case "01": return 1;  // Monoraria
    case "02": return 2;  // Bioraria
    case "03": return 3;  // Multioraria F1, F2, F3
    case "04": return 3;  // Multioraria F1, F23
    case "05": return 4;  // Multioraria F1, F2, F3, F0
    case "06": return 5;  // Fasce personalizzate
    default: return 0;
  }
};

// Section validators
export const sectionValidators: Record<string, SectionValidator> = {
  // Time bands required for electricity non-FLAT
  timeBands: (sectionData: any, context: ValidationContext): ValidationError[] | null => {
    const errors: ValidationError[] = [];
    const marketType = context.formData.offerDetails?.TIPO_MERCATO;
    const offerType = context.formData.offerDetails?.TIPO_OFFERTA;
    
    if (marketType === "01" && offerType !== "03") {
      if (!sectionData?.TIPOLOGIA_FASCE) {
        errors.push({
          field: "TIPOLOGIA_FASCE",
          message: "Time band configuration required for electricity offers",
          path: ["timeBands", "TIPOLOGIA_FASCE"]
        });
      } else {
        // Weekly schedule required for certain band types
        const requiresWeekly = ["02", "04", "05", "06"].includes(sectionData.TIPOLOGIA_FASCE);
        if (requiresWeekly && !sectionData.weeklyBands?.F_LUNEDI) {
          errors.push({
            field: "weeklyBands",
            message: "Weekly time band schedule required for selected band type",
            path: ["timeBands", "weeklyBands", "F_LUNEDI"]
          });
        }
      }
    }
    
    return errors.length > 0 ? errors : null;
  },

  // Company component validation for electricity
  electricityComponents: (sectionData: any, context: ValidationContext): ValidationError[] | null => {
    const errors: ValidationError[] = [];
    const marketType = context.formData.offerDetails?.TIPO_MERCATO;
    
    if (marketType !== "01" || !sectionData?.components) {
      return null;
    }

    const timeBands = context.formData.timeBands;
    const tipologiaFasce = timeBands?.TIPOLOGIA_FASCE;

    sectionData.components.forEach((component: any, idx: number) => {
      const intervals = component.IntervalloPrezzi || [];

      // Rule 1: Energy components need bands matching TIPOLOGIA_FASCE
      if (["02", "04", "06"].includes(component.MACROAREA)) {
        const allKwhPricing = intervals.every((i: any) => i.UNITA_MISURA === "03");
        if (allKwhPricing) {
          const expectedBands = getExpectedBandCount(tipologiaFasce);
          if (intervals.length !== expectedBands) {
            errors.push({
              field: `components[${idx}].intervals`,
              message: `Must have ${expectedBands} price intervals matching time bands`,
              path: ["electricityComponents", "components", idx.toString(), "intervals"]
            });
          }
        }
      }

      // Rule 2: Fixed components need single interval
      if (["01", "04", "05", "06"].includes(component.MACROAREA)) {
        const hasFixedPricing = intervals.some((i: any) => 
          ["01", "02", "05"].includes(i.UNITA_MISURA)
        );
        if (hasFixedPricing && intervals.length !== 1) {
          errors.push({
            field: `components[${idx}].intervals`,
            message: "Fixed pricing components must have exactly one interval",
            path: ["electricityComponents", "components", idx.toString(), "intervals"]
          });
        }
      }

      // Rule 3: Validate interval ranges
      intervals.forEach((interval: any, intIdx: number) => {
        if (interval.VALIDO_DA !== undefined && interval.VALIDO_FINO !== undefined) {
          if (interval.VALIDO_FINO <= interval.VALIDO_DA) {
            errors.push({
              field: `components[${idx}].intervals[${intIdx}].VALIDO_FINO`,
              message: "Valid until must be greater than valid from",
              path: ["electricityComponents", "components", idx.toString(), "intervals", intIdx.toString(), "VALIDO_FINO"]
            });
          }
        }
      });
    });

    return errors.length > 0 ? errors : null;
  },

  // Discount validation
  discounts: (sectionData: any, context: ValidationContext): ValidationError[] | null => {
    const errors: ValidationError[] = [];
    
    if (!sectionData?.discounts || !Array.isArray(sectionData.discounts)) {
      return null;
    }

    sectionData.discounts.forEach((discount: any, idx: number) => {
      // Validate validity configuration
      const hasSimpleValidity = !!discount.VALIDITA;
      const hasComplexValidity = discount.PeriodoValidita && (
        discount.PeriodoValidita.DURATA !== undefined ||
        discount.PeriodoValidita.VALIDO_FINO !== undefined ||
        (discount.PeriodoValidita.MESE_VALIDITA?.length > 0)
      );

      if (hasSimpleValidity && hasComplexValidity) {
        errors.push({
          field: `discounts[${idx}].validity`,
          message: "Cannot have both simple and complex validity configuration",
          path: ["discounts", idx.toString(), "validity"]
        });
      } else if (!hasSimpleValidity && !hasComplexValidity) {
        errors.push({
          field: `discounts[${idx}].validity`,
          message: "Must specify either simple validity or period validity",
          path: ["discounts", idx.toString(), "validity"]
        });
      }

      // Validate price configurations
      if (!discount.PREZZISconto || discount.PREZZISconto.length === 0) {
        errors.push({
          field: `discounts[${idx}].PREZZISconto`,
          message: "At least one price configuration is required",
          path: ["discounts", idx.toString(), "PREZZISconto"]
        });
      } else {
        discount.PREZZISconto.forEach((price: any, priceIdx: number) => {
          // Validate price range
          if (price.VALIDO_DA !== undefined && price.VALIDO_FINO !== undefined) {
            if (price.VALIDO_FINO <= price.VALIDO_DA) {
              errors.push({
                field: `discounts[${idx}].PREZZISconto[${priceIdx}].VALIDO_FINO`,
                message: "Valid until must be greater than valid from",
                path: ["discounts", idx.toString(), "PREZZISconto", priceIdx.toString(), "VALIDO_FINO"]
              });
            }
          }

          // Validate decimal places
          if (price.PREZZO !== undefined) {
            const decimalPlaces = (price.PREZZO.toString().split('.')[1] || '').length;
            if (decimalPlaces > 6) {
              errors.push({
                field: `discounts[${idx}].PREZZISconto[${priceIdx}].PREZZO`,
                message: "Maximum 6 decimal places allowed for price",
                path: ["discounts", idx.toString(), "PREZZISconto", priceIdx.toString(), "PREZZO"]
              });
            }
          }
        });
      }

      // Validate condition
      if (discount.Condizione?.CONDIZIONE_APPLICAZIONE === "99" && !discount.Condizione.DESCRIZIONE_CONDIZIONE) {
        errors.push({
          field: `discounts[${idx}].Condizione.DESCRIZIONE_CONDIZIONE`,
          message: "Description required when 'Other' condition is selected",
          path: ["discounts", idx.toString(), "Condizione", "DESCRIZIONE_CONDIZIONE"]
        });
      }
    });

    return errors.length > 0 ? errors : null;
  },

  // Additional services validation
  additionalServices: (sectionData: any, context: ValidationContext): ValidationError[] | null => {
    const errors: ValidationError[] = [];
    
    if (!sectionData?.services || !Array.isArray(sectionData.services)) {
      return null;
    }

    sectionData.services.forEach((service: any, idx: number) => {
      // Validate DETTAGLI_MACROAREA when MACROAREA = '99'
      if (service.MACROAREA === "99" && !service.DETTAGLI_MACROAREA) {
        errors.push({
          field: `services[${idx}].DETTAGLI_MACROAREA`,
          message: "Category details required for 'Other' category",
          path: ["additionalServices", "services", idx.toString(), "DETTAGLI_MACROAREA"]
        });
      }
    });

    return errors.length > 0 ? errors : null;
  },

  // Offer zones validation
  offerZones: (sectionData: any, context: ValidationContext): ValidationError[] | null => {
    const errors: ValidationError[] = [];
    
    const hasRegions = sectionData?.REGIONE?.length > 0;
    const hasProvinces = sectionData?.PROVINCIA?.length > 0;
    const hasMunicipalities = sectionData?.COMUNE?.length > 0;
    
    // If zones are specified, at least one must have selections
    if ((sectionData?.REGIONE || sectionData?.PROVINCIA || sectionData?.COMUNE) && 
        !hasRegions && !hasProvinces && !hasMunicipalities) {
      errors.push({
        field: "zones",
        message: "Select at least one geographical area if specifying zones",
        path: ["offerZones"]
      });
    }

    return errors.length > 0 ? errors : null;
  },

  // Consumption profile validation
  consumptionProfile: (sectionData: any, context: ValidationContext): ValidationError[] | null => {
    const errors: ValidationError[] = [];
    const marketType = context.formData.energyType?.TIPO_MERCATO || context.formData.offerDetails?.TIPO_MERCATO;
    
    // Annual consumption is required
    if (!sectionData?.CONSUMO_ANNUO) {
      errors.push({
        field: "CONSUMO_ANNUO",
        message: "Annual consumption is required",
        path: ["consumptionProfile", "CONSUMO_ANNUO"]
      });
    } else {
      // Validate consumption range
      const consumption = Number(sectionData.CONSUMO_ANNUO);
      if (isNaN(consumption) || consumption < 1 || consumption > 9_999_999) {
        errors.push({
          field: "CONSUMO_ANNUO",
          message: "Annual consumption must be between 1 and 9,999,999",
          path: ["consumptionProfile", "CONSUMO_ANNUO"]
        });
      }
    }
    
    // Validate time band distribution if present (electricity only)
    if (marketType === "01" && sectionData?.RIPARTIZIONE_FASCE) {
      const distribution = sectionData.RIPARTIZIONE_FASCE;
      if (distribution.F1 !== undefined && distribution.F2 !== undefined && distribution.F3 !== undefined) {
        const sum = distribution.F1 + distribution.F2 + distribution.F3;
        if (Math.abs(sum - 100) > 0.01) {
          errors.push({
            field: "RIPARTIZIONE_FASCE",
            message: "Time band percentages must sum to 100%",
            path: ["consumptionProfile", "RIPARTIZIONE_FASCE"]
          });
        }
        
        // Validate individual band percentages
        ['F1', 'F2', 'F3'].forEach(band => {
          const value = distribution[band];
          if (value < 0 || value > 100) {
            errors.push({
              field: `RIPARTIZIONE_FASCE.${band}`,
              message: `${band} percentage must be between 0 and 100`,
              path: ["consumptionProfile", "RIPARTIZIONE_FASCE", band]
            });
          }
        });
      }
    }
    
    // Validate winter percentage if present (gas only)
    if (marketType === "02" && sectionData?.PERCENTUALE_INVERNALE !== undefined) {
      const winterPercentage = Number(sectionData.PERCENTUALE_INVERNALE);
      if (isNaN(winterPercentage) || winterPercentage < 0 || winterPercentage > 100) {
        errors.push({
          field: "PERCENTUALE_INVERNALE",
          message: "Winter percentage must be between 0 and 100",
          path: ["consumptionProfile", "PERCENTUALE_INVERNALE"]
        });
      }
    }

    return errors.length > 0 ? errors : null;
  },
};

// Register all section validators
export const registerSectionValidators = (registry: any) => {
  Object.entries(sectionValidators).forEach(([name, validator]) => {
    registry.registerSectionValidator(name, validator);
  });
}; 