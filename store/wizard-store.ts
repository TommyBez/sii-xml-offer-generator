import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

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
  [key: string]: any; // Allow additional properties
}

// Wizard state interfaces
export interface WizardState {
  currentStep: number;
  completedSteps: Set<number>;
  formData: Partial<WizardFormData>;
  validationErrors: ValidationErrors;
  isDirty: boolean;
  lastSavedAt: Date | null;
}

export type ValidationErrors = Record<string, Record<string, string>>;

// Wizard actions interface
export interface WizardActions {
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  markStepIncomplete: (step: number) => void;
  updateFormData: (section: string, data: any) => void;
  setValidationErrors: (section: string, errors: Record<string, string>) => void;
  clearValidationErrors: (section?: string) => void;
  setIsDirty: (isDirty: boolean) => void;
  saveDraft: () => void;
  resetWizard: () => void;
  canNavigateToStep: (step: number) => boolean;
}

// Initial state
const initialState: WizardState = {
  currentStep: 0,
  completedSteps: new Set<number>(),
  formData: {},
  validationErrors: {},
  isDirty: false,
  lastSavedAt: null,
};

// Create the store with persistence
export const useWizardStore = create<WizardState & WizardActions>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // Actions
        setCurrentStep: (step) => {
          set({ currentStep: step }, false, 'setCurrentStep');
        },

        markStepCompleted: (step) => {
          set(
            (state) => ({
              completedSteps: new Set([...state.completedSteps, step]),
            }),
            false,
            'markStepCompleted'
          );
        },

        markStepIncomplete: (step) => {
          set(
            (state) => {
              const newCompletedSteps = new Set(state.completedSteps);
              newCompletedSteps.delete(step);
              return { completedSteps: newCompletedSteps };
            },
            false,
            'markStepIncomplete'
          );
        },

        updateFormData: (section, data) => {
          set(
            (state) => ({
              formData: {
                ...state.formData,
                [section]: data,
              },
              isDirty: true,
            }),
            false,
            'updateFormData'
          );
        },

        setValidationErrors: (section, errors) => {
          set(
            (state) => ({
              validationErrors: {
                ...state.validationErrors,
                [section]: errors,
              },
            }),
            false,
            'setValidationErrors'
          );
        },

        clearValidationErrors: (section) => {
          set(
            (state) => {
              if (section) {
                const { [section]: _, ...rest } = state.validationErrors;
                return { validationErrors: rest };
              }
              return { validationErrors: {} };
            },
            false,
            'clearValidationErrors'
          );
        },

        setIsDirty: (isDirty) => {
          set({ isDirty }, false, 'setIsDirty');
        },

        saveDraft: () => {
          set(
            {
              isDirty: false,
              lastSavedAt: new Date(),
            },
            false,
            'saveDraft'
          );
        },

        resetWizard: () => {
          set(initialState, false, 'resetWizard');
        },

        canNavigateToStep: (step) => {
          const state = get();
          // Can always go back to previous steps
          if (step < state.currentStep) return true;
          
          // Can navigate to the next immediate step (to allow completion of current step)
          if (step === state.currentStep + 1) return true;
          
          // For steps beyond the next one, check if all previous steps are completed
          for (let i = 0; i < step; i++) {
            if (!state.completedSteps.has(i)) return false;
          }
          return true;
        },
      }),
      {
        name: 'wizard-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          formData: state.formData,
          completedSteps: Array.from(state.completedSteps),
          currentStep: state.currentStep,
          lastSavedAt: state.lastSavedAt,
        }),
        onRehydrateStorage: () => (state) => {
          if (state && state.completedSteps) {
            // Convert array back to Set after rehydration
            state.completedSteps = new Set(state.completedSteps as any);
          }
        },
      }
    ),
    {
      name: 'wizard-store',
    }
  )
); 