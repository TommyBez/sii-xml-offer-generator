import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { useStepper } from '@/lib/stepper';
import { useEffect } from 'react';

export interface UseWizardStepFormOptions {
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  reValidateMode?: 'onBlur' | 'onChange' | 'onSubmit';
}

export const useWizardStepForm = <T extends z.ZodTypeAny>(
  options: UseWizardStepFormOptions = {}
): UseFormReturn<z.infer<T>> & {
  stepper: ReturnType<typeof useStepper>;
  onSubmit: (callback: (data: z.infer<T>) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
} => {
  const { mode = 'onBlur', reValidateMode = 'onChange' } = options;
  const stepper = useStepper();
  const currentStep = stepper.current;

  // Create form with the current step's schema
  const form = useForm<z.infer<T>>({
    mode,
    reValidateMode,
    resolver: zodResolver(currentStep.schema),
    defaultValues: {},
  });

  // Update metadata when form validation state changes
  useEffect(() => {
    const subscription = form.watch(() => {
      // Update isValid metadata based on form state
      stepper.when({
        id: currentStep.id,
        isValid: form.formState.isValid,
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form, stepper, currentStep.id]);

  // Custom submit handler that updates stepper state
  const onSubmit = (callback: (data: z.infer<T>) => void | Promise<void>) => {
    return form.handleSubmit(async (data) => {
      // Execute the custom callback
      await callback(data);
      
      // Mark step as completed and move to next
      stepper.when({
        id: currentStep.id,
        completed: true,
        isValid: true,
      });
      
      // Proceed to next step
      stepper.next();
    });
  };

  return {
    ...form,
    stepper,
    onSubmit,
  };
}; 