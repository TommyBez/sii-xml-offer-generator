import { z } from "zod";

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

// Type exports from schemas
export type Company = z.infer<typeof companySchema>;
export type OfferItem = z.infer<typeof offerItemSchema>;
export type Offer = z.infer<typeof offerSchema>;
export type WizardStep = z.infer<typeof wizardStepSchema>;
