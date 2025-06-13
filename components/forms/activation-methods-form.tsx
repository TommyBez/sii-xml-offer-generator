'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore } from '@/store/wizard-store';
import { activationMethodsSchema, type ActivationMethodsData } from '@/schemas';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActivationMethodsFormProps {
  initialData?: Partial<ActivationMethodsData>;
  onSubmit?: (data: ActivationMethodsData) => void;
}

const activationOptions = [
  { value: "01", label: "Web-only activation", description: "Offer can only be activated through web channels" },
  { value: "02", label: "Any channel activation", description: "Offer can be activated through any available channel" },
  { value: "03", label: "Point of sale", description: "Activation at physical store locations" },
  { value: "04", label: "Teleselling", description: "Activation through telephone sales" },
  { value: "05", label: "Agency", description: "Activation through authorized agencies" },
  { value: "99", label: "Other", description: "Specify custom activation method below" },
];

export function ActivationMethodsForm({ initialData, onSubmit }: ActivationMethodsFormProps) {
  const { updateFormData, formData } = useWizardStore();
  const [showDescription, setShowDescription] = useState(false);
  
  const form = useForm<ActivationMethodsData>({
    resolver: zodResolver(activationMethodsSchema),
    defaultValues: {
      MODALITA: [],
      DESCRIZIONE: "",
      ...initialData,
      ...(formData?.activationMethods || {}),
    },
  });

  const watchedModalita = form.watch('MODALITA');
  const watchedDescrizione = form.watch('DESCRIZIONE');

  // Update show description state when MODALITA changes
  useEffect(() => {
    setShowDescription(watchedModalita.includes('99'));
  }, [watchedModalita]);

  // Save form data to store on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData('activationMethods', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const handleFormSubmit = (data: ActivationMethodsData) => {
    updateFormData('activationMethods', data);
    onSubmit?.(data);
  };

  const characterCount = watchedDescrizione?.length || 0;
  const maxCharacters = 2000;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Activation Methods</h3>
            <p className="text-sm text-muted-foreground">
              Select all the channels through which customers can activate this offer.
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You must select at least one activation method. If you select "Other", 
              you'll need to provide a description.
            </AlertDescription>
          </Alert>

          <FormField
            control={form.control}
            name="MODALITA"
            render={() => (
              <FormItem>
                <FormLabel>Available Activation Methods *</FormLabel>
                <FormDescription>
                  Check all methods that apply to this offer
                </FormDescription>
                <fieldset className="space-y-4 mt-4" role="group" aria-required="true">
                  <legend className="sr-only">Select activation methods</legend>
                  {activationOptions.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="MODALITA"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.value}
                            className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  const newValues = checked
                                    ? [...currentValues, option.value]
                                    : currentValues.filter((value) => value !== option.value);
                                  field.onChange(newValues);
                                }}
                                aria-describedby={`${option.value}-description`}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none flex-1">
                              <FormLabel className="text-sm font-medium cursor-pointer">
                                {option.label}
                                {option.value === "99" && showDescription && (
                                  <span className="text-destructive ml-1">*</span>
                                )}
                              </FormLabel>
                              <p id={`${option.value}-description`} className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </fieldset>
                <FormMessage />
              </FormItem>
            )}
          />

          <AnimatePresence mode="wait">
            {showDescription && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <FormField
                  control={form.control}
                  name="DESCRIZIONE"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>
                        Description for Other Method <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormDescription>
                        Please describe the custom activation method(s) for this offer
                      </FormDescription>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            {...field}
                            placeholder="Describe the custom activation method..."
                            className="min-h-[120px] resize-y"
                            maxLength={maxCharacters}
                            aria-required={showDescription}
                            aria-describedby="description-character-count"
                          />
                          <div 
                            id="description-character-count"
                            className="absolute bottom-2 right-2 text-xs text-muted-foreground"
                            aria-live="polite"
                          >
                            {characterCount}/{maxCharacters}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button type="submit" className="hidden" aria-hidden="true">
          Submit
        </button>
      </form>
    </Form>
  );
} 