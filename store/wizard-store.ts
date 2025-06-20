import { create, type StateCreator } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer, produce, type Draft } from 'zustand/middleware/immer';

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
type StoreSlice = WizardState & WizardActions;

const immerMutate = <T>(fn: (draft: Draft<T>) => void) => (state: T) => produce(state, fn);

const storeCreator: StateCreator<StoreSlice, [], [], StoreSlice> = (set, get) => ({
  // ────────── State ──────────
  ...initialState,

  // ────────── Actions ──────────
  updateFormData: (section: string, data: unknown): void => {
    set(immerMutate((state: Draft<StoreSlice>) => {
      state.formData[section] = {
        ...((state.formData as Record<string, any>)[section] ?? {}),
        ...(data as object),
      };
      state.isDirty = true;
    }));
  },

  setValidationErrors: (section: string, errors: Record<string, string>): void => {
    set(immerMutate((state: Draft<StoreSlice>) => {
      state.validationErrors[section] = errors;
    }));
  },

  clearValidationErrors: (section?: string): void => {
    set(immerMutate((state: Draft<StoreSlice>) => {
      if (section) {
        delete state.validationErrors[section];
      } else {
        state.validationErrors = {};
      }
    }));
  },

  setIsDirty: (dirty: boolean): void => {
    set(immerMutate((state: Draft<StoreSlice>) => {
      state.isDirty = dirty;
    }));
  },

  saveDraft: (): void => {
    set(immerMutate((state: Draft<StoreSlice>) => {
      state.isDirty = false;
      state.lastSavedAt = new Date();
    }));
  },

  resetWizard: (): void => {
    set((): StoreSlice => ({ ...initialState }));
  },
});

export const useWizardStore = create<StoreSlice>()(
  devtools(
    persist(immer(storeCreator), {
      name: 'wizard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        formData: state.formData,
        lastSavedAt: state.lastSavedAt,
      }),
    }),
    { name: 'wizard-store' }
  )
); 