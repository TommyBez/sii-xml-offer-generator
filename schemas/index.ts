import { z } from "zod";

// Identification validation schema
export const identificationSchema = z.object({
  PIVA_UTENTE: z
    .string()
    .length(16, "VAT number must be exactly 16 characters")
    .regex(/^[A-Z0-9]+$/, "Only alphanumeric characters allowed"),
  COD_OFFERTA: z
    .string()
    .min(1, "Offer code is required")
    .max(32, "Maximum 32 characters allowed")
    .regex(/^[A-Z0-9]+$/, "Only alphanumeric characters allowed"),
});

// Company validation schema
export const companySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Company name is required"),
  vatNumber: z.string().min(1, "VAT number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

// Offer item validation schema
export const offerItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
  vatRate: z.number().min(0).max(100, "VAT rate must be between 0 and 100"),
  discount: z.number().min(0).max(100).optional(),
});

// Offer validation schema
export const offerSchema = z.object({
  id: z.string().uuid(),
  offerNumber: z.string().min(1, "Offer number is required"),
  date: z.coerce.date(),
  validUntil: z.coerce.date(),
  issuer: companySchema,
  recipient: companySchema,
  items: z.array(offerItemSchema).min(1, "At least one item is required"),
  currency: z.string().length(3, "Currency must be 3 characters (e.g., EUR)"),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
});

// Wizard step validation schema
export const wizardStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  isCompleted: z.boolean(),
});

// Offer Details validation schema
export const offerDetailsSchema = z
  .object({
    TIPO_MERCATO: z.enum(["01", "02", "03"], {
      required_error: "Market type is required",
    }),
    OFFERTA_SINGOLA: z.enum(["SI", "NO"]).optional(),
    TIPO_CLIENTE: z.string({
      required_error: "Client type is required",
    }),
    DOMESTICO_RESIDENTE: z.string().optional(),
    TIPO_OFFERTA: z.enum(["01", "02", "03"], {
      required_error: "Offer type is required",
    }),
    TIPOLOGIA_ATT_CONTR: z
      .array(z.string())
      .min(1, "At least one contract activation type is required"),
    NOME_OFFERTA: z
      .string()
      .min(1, "Offer name is required")
      .max(255, "Maximum 255 characters allowed")
      .regex(/^[a-zA-Z0-9\s\-_\.]+$/, "Only alphanumeric characters, spaces, hyphens, underscores, and dots allowed"),
    DESCRIZIONE: z
      .string()
      .max(3000, "Maximum 3000 characters allowed"),
    DURATA: z
      .number()
      .int()
      .min(-1, "Duration must be -1 (indeterminate) or between 1-99")
      .max(99, "Duration must be -1 (indeterminate) or between 1-99")
      .refine((val) => val === -1 || val >= 1, {
        message: "Duration must be -1 (indeterminate) or between 1-99",
      }),
    GARANZIE: z
      .string()
      .max(3000, "Maximum 3000 characters allowed")
      .default("NO"),
  })
  .refine(
    (data) => {
      // Single offer required for non-dual fuel offers
      if (data.TIPO_MERCATO !== "03" && !data.OFFERTA_SINGOLA) {
        return false;
      }
      return true;
    },
    {
      message: "Single offer selection required for non-dual fuel offers",
      path: ["OFFERTA_SINGOLA"],
    }
  )
  .refine(
    (data) => {
      // Residential condominium only available for gas
      if (data.TIPO_CLIENTE === "03" && data.TIPO_MERCATO !== "02") {
        return false;
      }
      return true;
    },
    {
      message: "Residential condominium is only available for gas market",
      path: ["TIPO_CLIENTE"],
    }
  );

// Type exports from schemas
export type IdentificationData = z.infer<typeof identificationSchema>;
export type Company = z.infer<typeof companySchema>;
export type OfferItem = z.infer<typeof offerItemSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type WizardStep = z.infer<typeof wizardStepSchema>;
export type OfferDetailsData = z.infer<typeof offerDetailsSchema>;

// Activation Methods validation schema
export const activationMethodsSchema = z
  .object({
    MODALITA: z
      .array(z.enum(["01", "02", "03", "04", "05", "99"]))
      .min(1, "Select at least one activation method"),
    DESCRIZIONE: z.string().max(2000).optional(),
  })
  .refine(
    (data) => {
      // If "Other" (99) is selected, description is required
      if (data.MODALITA.includes("99") && !data.DESCRIZIONE) {
        return false;
      }
      return true;
    },
    {
      message: "Description required when 'Other' is selected",
      path: ["DESCRIZIONE"],
    }
  );

export type ActivationMethodsData = z.infer<typeof activationMethodsSchema>;

// Contact Information validation schema
export const contactInformationSchema = z.object({
  TELEFONO: z
    .string()
    .max(15)
    .regex(/^[\d\s\+\-\(\)]+$/, "Invalid phone format")
    .transform((val: string) => val.replace(/\s/g, "")), // Remove spaces
  URL_SITO_VENDITORE: z
    .string()
    .max(100)
    .url("Invalid URL format")
    .or(z.literal("")), // Allow empty
  URL_OFFERTA: z.string().max(100).url("Invalid URL format").or(z.literal("")), // Allow empty
});

export type ContactInformationData = z.infer<typeof contactInformationSchema>;

// Energy Price References validation schema
export const energyPriceReferencesSchema = z
  .object({
    IDX_PREZZO_ENERGIA: z.string({
      required_error: "Price index is required",
    }),
    ALTRO: z.string().max(3000).optional(),
  })
  .refine(
    (data) => {
      // If "Other" (99) is selected, description is required
      if (data.IDX_PREZZO_ENERGIA === "99" && !data.ALTRO) {
        return false;
      }
      return true;
    },
    {
      message: "Description required for custom index",
      path: ["ALTRO"],
    }
  );

// Offer Validity validation schema
export const offerValiditySchema = z
  .object({
    DATA_INIZIO: z
      .string()
      .regex(
        /^\d{2}\/\d{2}\/\d{4}_\d{2}:\d{2}:\d{2}$/,
        "Format must be DD/MM/YYYY_HH:MM:SS"
      ),
    DATA_FINE: z
      .string()
      .regex(
        /^\d{2}\/\d{2}\/\d{4}_\d{2}:\d{2}:\d{2}$/,
        "Format must be DD/MM/YYYY_HH:MM:SS"
      ),
  })
  .refine(
    (data) => {
      // Parse Italian date format
      const parseDate = (dateStr: string): Date => {
        const [datePart, timePart] = dateStr.split('_');
        const [day, month, year] = datePart.split('/');
        const [hours, minutes, seconds] = timePart.split(':');
        return new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        );
      };
      
      const start = parseDate(data.DATA_INIZIO);
      const end = parseDate(data.DATA_FINE);
      return end > start;
    },
    {
      message: "End date must be after start date",
      path: ["DATA_FINE"],
    }
  );

export type EnergyPriceReferencesData = z.infer<typeof energyPriceReferencesSchema>;
export type OfferValidityData = z.infer<typeof offerValiditySchema>;

// Offer Characteristics validation schema
export const offerCharacteristicsSchema = z
  .object({
    CONSUMO_MIN: z.number().int().min(0).max(999999999).optional(),
    CONSUMO_MAX: z.number().int().min(0).max(999999999).optional(),
    POTENZA_MIN: z.number().multipleOf(0.1).min(0).max(99.9).optional(),
    POTENZA_MAX: z.number().multipleOf(0.1).min(0).max(99.9).optional(),
  })
  .refine(
    (data) => {
      // Consumption range validation
      if (data.CONSUMO_MIN !== undefined && data.CONSUMO_MAX !== undefined) {
        return data.CONSUMO_MAX > data.CONSUMO_MIN;
      }
      return true;
    },
    {
      message: "Maximum consumption must be greater than minimum consumption",
      path: ["CONSUMO_MAX"],
    }
  )
  .refine(
    (data) => {
      // Power range validation
      if (data.POTENZA_MIN !== undefined && data.POTENZA_MAX !== undefined) {
        return data.POTENZA_MAX > data.POTENZA_MIN;
      }
      return true;
    },
    {
      message: "Maximum power must be greater than minimum power",
      path: ["POTENZA_MAX"],
    }
  );

export type OfferCharacteristicsData = z.infer<typeof offerCharacteristicsSchema>;

// Payment Methods validation schema
export const paymentMethodsSchema = z
  .object({
    MODALITA_PAGAMENTO: z
      .array(z.enum(["01", "02", "03", "04", "99"]))
      .min(1, "Select at least one payment method"),
    DESCRIZIONE: z.string().max(25).optional(),
  })
  .refine(
    (data) => {
      // If "Other" (99) is selected, description is required
      if (data.MODALITA_PAGAMENTO.includes("99") && !data.DESCRIZIONE) {
        return false;
      }
      return true;
    },
    {
      message: "Description required when 'Other' is selected",
      path: ["DESCRIZIONE"],
    }
  );

export type PaymentMethodsData = z.infer<typeof paymentMethodsSchema>;

// Regulated Components validation schema
export const regulatedComponentsSchema = z.object({
  CODICE: z.array(z.string()).optional().default([]),
});

export type RegulatedComponentsData = z.infer<typeof regulatedComponentsSchema>;
