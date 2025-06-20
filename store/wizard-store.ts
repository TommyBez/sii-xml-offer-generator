import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

/**
 * Shape of the wizard form data. The interface is intentionally
 * verbose to preserve the original type-safety while we migrate the
 * navigation logic to Stepperize. Only form-related data should live
 * in this store.
 */
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
  issuerDetails?: Record<string, unknown>;
  recipientDetails?: Record<string, unknown>;
  additionalServices?: Record<string, unknown>;
  [key: string]: unknown;
}

export type ValidationErrors = Record<string, Record<string, string>>;

/**
 * Store state – trimmed down to PURE FORM DATA persistence.
 */
export interface WizardState {
  formData: Partial<WizardFormData>;
  validationErrors: ValidationErrors;
  isDirty: boolean;
  lastSavedAt: Date | null;
}

/**
 * Store actions that mutate the form data.
 */
export interface WizardActions {
  updateFormData: (section: string, data: unknown) => void;
  setValidationErrors: (section: string, errors: Record<string, string>) => void;
  clearValidationErrors: (section?: string) => void;
  setIsDirty: (dirty: boolean) => void;
  saveDraft: () => void;
  resetWizard: () => void;
}

// ────────────────────────────────────────────────────────────
// Initial state
// ────────────────────────────────────────────────────────────
const initialState: WizardState = {
  formData: {},
  validationErrors: {},
  isDirty: false,
  lastSavedAt: null,
};

// ────────────────────────────────────────────────────────────
// Store definition
// ────────────────────────────────────────────────────────────
export const useWizardStore = create<WizardState & WizardActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // ────────── State ──────────
        ...initialState,

        // ────────── Actions ──────────
        updateFormData: (section, data) => {
          set((state: any) => {
            state.formData[section] = {
              ...((state.formData as Record<string, any>)[section] ?? {}),
              ...(data as object),
            };
            state.isDirty = true;
          });
        },

        setValidationErrors: (section, errors) => {
          set((state: any) => {
            state.validationErrors[section] = errors;
          });
        },

        clearValidationErrors: (section?: string) => {
          set((state: any) => {
            if (section) {
              delete state.validationErrors[section];
            } else {
              state.validationErrors = {};
            }
          });
        },

        setIsDirty: (dirty: boolean) => {
          set((state: any) => {
            state.isDirty = dirty;
          });
        },

        saveDraft: () => {
          set((state: any) => {
            state.isDirty = false;
            state.lastSavedAt = new Date();
          });
        },

        resetWizard: () => {
          set(() => ({ ...initialState }));
        },
      })),
      {
        name: 'wizard-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state: any) => ({
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