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
  currentStep: number;
  completedSteps: Set<number>;
  formData: Partial<WizardFormData>;
  validationErrors: ValidationErrors;
  isDirty: boolean;
  lastSavedAt: Date | null;
}

export type ValidationErrors = Record<string, Record<string, string>>;

// Stepper state interface (new stepperize integration)
export interface StepperState {
  currentId: StepId;
  completed: Set<StepId>;
  validMap: Record<StepId, boolean>;
  goTo: (id: StepId) => void;
  next: () => void;
  prev: () => void;
  markValid: (id: StepId, valid: boolean) => void;
  resetStepper: () => void;
  getVisibleSteps: () => StepId[];
  getAccessibleSteps: () => StepId[];
  isStepVisible: (stepId: StepId) => boolean;
  isStepAccessible: (stepId: StepId) => boolean;
  canNavigateToStepId: (stepId: StepId) => boolean;
}

// Stepper actions interface (new stepperize integration)
export interface StepperActions {
  goTo: (id: StepId) => void;
  next: () => void;
  prev: () => void;
  markValid: (id: StepId, valid: boolean) => void;
  resetStepper: () => void;
}

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

// Initial stepper state
const initialStepperState: StepperState = {
  currentId: stepOrder[0],
  completed: new Set<StepId>(),
  validMap: {} as Record<StepId, boolean>,
  goTo: () => {},
  next: () => {},
  prev: () => {},
  markValid: () => {},
  resetStepper: () => {},
  getVisibleSteps: () => [],
  getAccessibleSteps: () => [],
  isStepVisible: () => false,
  isStepAccessible: () => false,
  canNavigateToStepId: () => false,
};

// Create the store with persistence
export const useWizardStore = create<WizardState & WizardActions & StepperState & StepperActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        ...initialState,
        ...initialStepperState,

        // ───────────────────── stepper slice ──────────────────────
        goTo: (id) => {
          const state = get();
          // Allow navigation to any visible step, let UI handle accessibility
          if (state.isStepVisible(id)) {
            set((s) => {
              s.currentId = id;
            });
          }
        },
        
        next: () => {
          const state = get();
          const visibleSteps = state.getVisibleSteps();
          const currentIndex = visibleSteps.indexOf(state.currentId);
          
          if (currentIndex < visibleSteps.length - 1) {
            const nextStepId = visibleSteps[currentIndex + 1];
            if (state.canNavigateToStepId(nextStepId)) {
              set((s) => {
                s.currentId = nextStepId;
              });
            }
          }
        },
        
        prev: () => {
          const state = get();
          const visibleSteps = state.getVisibleSteps();
          const currentIndex = visibleSteps.indexOf(state.currentId);
          
          if (currentIndex > 0) {
            const prevStepId = visibleSteps[currentIndex - 1];
            set((s) => {
              s.currentId = prevStepId;
            });
          }
        },
        
        markValid: (id, valid) => set((s) => {
          s.validMap[id] = valid;
          
          // Mark step as completed if it becomes valid
          if (valid) {
            s.completed.add(id);
          } else {
            s.completed.delete(id);
          }
        }),
        
        resetStepper: () => set((s) => {
          s.currentId = stepOrder[0];
          s.completed.clear();
          s.validMap = {} as Record<StepId, boolean>;
        }),

        // New conditional logic methods
        getVisibleSteps: () => {
          const state = get();
          try {
            return getVisibleSteps(state, state.completed);
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
            return Boolean(isStepVisible(stepId, state));
          } catch {
            // Fallback for SSR/hydration - return true for first few steps
            return stepOrder.indexOf(stepId) < 3;
          }
        },

        isStepAccessible: (stepId) => {
          const state = get();
          try {
            return Boolean(isStepAccessible(stepId, state, state.completed));
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

        // ───────────────────── original wizard actions ──────────────────────
        setCurrentStep: (step) => {
          set((state) => {
            state.currentStep = step;
          });
        },

        markStepCompleted: (step) => {
          set((state) => {
            state.completedSteps.add(step);
          });
        },

        markStepIncomplete: (step) => {
          set((state) => {
            state.completedSteps.delete(step);
          });
        },

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
          set((state) => {
            // Reset wizard state
            Object.assign(state, initialState);
            // Reset stepper state
            Object.assign(state, initialStepperState);
          });
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
      })),
      {
        name: 'wizard-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          formData: state.formData,
          completedSteps: Array.from(state.completedSteps),
          currentStep: state.currentStep,
          lastSavedAt: state.lastSavedAt,
          // Stepper state
          currentId: state.currentId,
          completed: Array.from(state.completed),
          validMap: state.validMap,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Convert arrays back to Sets after rehydration
            if (state.completedSteps) {
              state.completedSteps = new Set(state.completedSteps as any);
            }
            if (state.completed) {
              state.completed = new Set(state.completed as any);
            }
          }
        },
      }
    ),
    {
      name: 'wizard-store',
    }
  )
); 