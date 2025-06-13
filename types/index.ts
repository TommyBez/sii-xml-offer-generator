// Main types for SII XML Offer Generator

export interface Company {
  id: string;
  name: string;
  vatNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface OfferItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount?: number;
}

export interface Offer {
  id: string;
  offerNumber: string;
  date: Date;
  validUntil: Date;
  issuer: Company;
  recipient: Company;
  items: OfferItem[];
  currency: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}
