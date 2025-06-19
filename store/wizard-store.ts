import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { StepId } from '@/components/wizard/stepper-layout';
import { stepOrder, isStepVisible, isStepAccessible, getVisibleSteps } from '@/components/wizard/stepper-layout';

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

// Wizard state interfaces
export interface WizardState {
  // Pure form-data slice (navigation handled by Stepperize)
  formData: Partial<WizardFormData>;
  validationErrors: ValidationErrors;
  isDirty: boolean;
  lastSavedAt: Date | null;
}

export type ValidationErrors = Record<string, Record<string, string>>;

// Stepper state interface – only metadata needed by consumers
export interface StepperState {
  currentId: StepId;
  completed: Set<StepId>;
  markValid: (id: StepId, valid: boolean) => void;
  resetStepper: () => void;
  setCurrentId: (id: StepId) => void;

  // Helper selectors (delegating to stepper-logic helpers)
  getVisibleSteps: () => StepId[];
  getAccessibleSteps: () => StepId[];
  isStepVisible: (stepId: StepId) => boolean;
  isStepAccessible: (stepId: StepId) => boolean;
  canNavigateToStepId: (stepId: StepId) => boolean;
}

// Wizard actions interface
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

// Initial stepper state
const initialStepperState: StepperState = {
  currentId: stepOrder[0],
  completed: new Set<StepId>(),
  markValid: () => {},
  resetStepper: () => {},
  setCurrentId: () => {},
  getVisibleSteps: () => [],
  getAccessibleSteps: () => [],
  isStepVisible: () => false,
  isStepAccessible: () => false,
  canNavigateToStepId: () => false,
};

// Create the store with persistence (form data only persisted)
export const useWizardStore = create<WizardState & WizardActions & StepperState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        ...initialState,
        ...initialStepperState,

        // ───────────────────── stepper metadata helpers ──────────────────────

        setCurrentId: (id) => set((s) => {
          s.currentId = id;
        }),

        markValid: (id, valid) => set((s) => {
          if (valid) {
            s.completed.add(id);
          } else {
            s.completed.delete(id);
          }
        }),

        resetStepper: () => set((s) => {
          s.currentId = stepOrder[0];
          s.completed.clear();
        }),

        // New conditional logic methods
        getVisibleSteps: () => {
          const state = get();
          try {
            return getVisibleSteps(state.formData, state.completed);
          } catch {
            // Fallback for SSR/hydration
            return stepOrder.slice(0, 3); // Return safe default
          }
        },

        getAccessibleSteps: () => {
          const state = get();
          try {
            const visibleSteps = state.getVisibleSteps();
            return visibleSteps.filter(stepId => state.isStepAccessible(stepId));
          } catch {
            // Fallback for SSR/hydration
            return stepOrder.slice(0, 3);
          }
        },

        isStepVisible: (stepId) => {
          const state = get();
          try {
            return Boolean(isStepVisible(stepId, state.formData));
          } catch {
            // Fallback for SSR/hydration - return true for first few steps
            return stepOrder.indexOf(stepId) < 3;
          }
        },

        isStepAccessible: (stepId) => {
          const state = get();
          try {
            return Boolean(isStepAccessible(stepId, state.formData, state.completed));
          } catch {
            // Fallback for SSR/hydration - return true for first few steps
            return stepOrder.indexOf(stepId) < 3;
          }
        },

        canNavigateToStepId: (stepId) => {
          const state = get();
          try {
            return Boolean(state.isStepVisible(stepId) && state.isStepAccessible(stepId));
          } catch {
            // Fallback for SSR/hydration
            return stepOrder.indexOf(stepId) < 3;
          }
        },

        // ───────────────────── original wizard actions (data only) ──────────────────────
        updateFormData: (section, data) => {
          set((state) => {
            // Use Object.assign to properly merge the data
            state.formData[section] = Object.assign({}, state.formData[section], data);
            state.isDirty = true;
          });
        },

        setValidationErrors: (section, errors) => {
          set((state) => {
            state.validationErrors[section] = errors;
          });
        },

        clearValidationErrors: (section) => {
          set((state) => {
            if (section) {
              delete state.validationErrors[section];
            } else {
              state.validationErrors = {};
            }
          });
        },

        setIsDirty: (isDirty) => {
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
          set(() => ({
            ...initialState,
            ...initialStepperState,
          }));
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