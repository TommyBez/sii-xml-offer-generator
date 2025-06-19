import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';

// Enable MapSet plugin for Immer to handle Set data structures
enableMapSet();

// Type for wizard form data structure
export interface WizardFormData {
  identification?: {
    PIVA_UTENTE?: string;
    COD_OFFERTA?: string;
  };
  energyPriceReferences?: {
    IDX_PREZZO_ENERGIA?: string;
    ALTRO?: string;
  };
  offerValidity?: {
    DATA_INIZIO?: string;
    DATA_FINE?: string;
  };
  offerNumber?: string;
  date?: Date;
  validUntil?: Date;
  currency?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  issuer?: {
    id?: string;
    name?: string;
    vatNumber?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  recipient?: {
    id?: string;
    name?: string;
    vatNumber?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  items?: Array<{
    id?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    vatRate?: number;
    discount?: number;
  }>;
  energyType?: {
    type?: string;
    includesGreenOptions?: boolean;
    TIPO_MERCATO?: string;
    AZIONE?: string;
  };
  consumptionProfile?: any;
  pricingStructure?: any;
  contractDuration?: any;
  greenEnergy?: any;
  networkCosts?: any;
  taxesFees?: any;
  discounts?: any;
  paymentTermsDetails?: any;
  meterReading?: any;
  connectionDetails?: any;
  serviceLevel?: any;
  specialConditions?: any;
  regulatoryCompliance?: any;
  regulatedComponents?: {
    CODICE?: string[];
  };
  additionalServices?: {
    services?: Array<{
      NOME?: string;
      DETTAGLIO?: string;
      MACROAREA?: string;
      DETTAGLI_MACROAREA?: string;
    }>;
  };
  issuerDetails?: {
    DENOMINAZIONE?: string;
    PIVA?: string;
    INDIRIZZO_SEDE?: string;
    CAP_SEDE?: string;
    COMUNE_SEDE?: string;
    PROVINCIA_SEDE?: string;
    REA?: string;
    PEC?: string;
    TELEFONO?: string;
  };
  recipientDetails?: {
    RAGIONE_SOCIALE?: string;
    CODICE_FISCALE?: string;
    INDIRIZZO?: string;
    CAP?: string;
    COMUNE?: string;
    PROVINCIA?: string;
    PARTITA_IVA?: string;
    TELEFONO?: string;
  };
  offerDetails?: {
    TIPO_MERCATO?: string;
    TIPO_OFFERTA?: string;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional properties
}

// Wizard state interfaces - simplified to only form data
export interface WizardState {
  formData: Partial<WizardFormData>;
  validationErrors: ValidationErrors;
  isDirty: boolean;
  lastSavedAt: Date | null;
}

export type ValidationErrors = Record<string, Record<string, string>>;

// Wizard actions interface - only form data related actions
export interface WizardActions {
  updateFormData: (section: string, data: any) => void;
  setValidationErrors: (section: string, errors: Record<string, string>) => void;
  clearValidationErrors: (section?: string) => void;
  setIsDirty: (isDirty: boolean) => void;
  saveDraft: () => void;
  resetWizard: () => void;
}

// Initial state
const initialState: WizardState = {
  formData: {},
  validationErrors: {},
  isDirty: false,
  lastSavedAt: null,
};

// Create the store with persistence
export const useWizardStore = create<WizardState & WizardActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        ...initialState,

        // ───────────────────── form data actions ──────────────────────
        updateFormData: (section: string, data: any) => {
          set((state) => {
            // Use Object.assign to properly merge the data
            state.formData[section] = Object.assign({}, state.formData[section], data);
            state.isDirty = true;
          });
        },

        setValidationErrors: (section: string, errors: Record<string, string>) => {
          set((state) => {
            state.validationErrors[section] = errors;
          });
        },

        clearValidationErrors: (section?: string) => {
          set((state) => {
            if (section) {
              delete state.validationErrors[section];
            } else {
              state.validationErrors = {};
            }
          });
        },

        setIsDirty: (isDirty: boolean) => {
          set((state) => {
            state.isDirty = isDirty;
          });
        },

        saveDraft: () => {
          set((state) => {
            state.isDirty = false;
            state.lastSavedAt = new Date();
          });
        },

        resetWizard: () => {
          set((state) => {
            // Reset wizard state to initial values
            Object.assign(state, initialState);
          });
        },
      })),
      {
        name: 'wizard-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          formData: state.formData,
          lastSavedAt: state.lastSavedAt,
        }),
      }
    ),
    {
      name: 'wizard-store',
    }
  )
); 