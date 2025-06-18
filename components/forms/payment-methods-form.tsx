'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStepForm } from '@/hooks/use-wizard-step-form';

import { paymentMethodsSchema, type PaymentMethodsData } from '@/schemas';
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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, CreditCard, Building, FileText, MoreHorizontal, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PaymentMethodsFormProps {
  initialData?: Partial<PaymentMethodsData>;
  onSubmit?: (data: PaymentMethodsData) => void;
}

const paymentOptions = [
  { 
    value: "01", 
    label: "Bank direct debit", 
    description: "Domiciliazione bancaria",
    icon: Building,
    category: "digital"
  },
  { 
    value: "02", 
    label: "Postal direct debit", 
    description: "Domiciliazione postale",
    icon: FileText,
    category: "traditional"
  },
  { 
    value: "03", 
    label: "Credit card direct debit", 
    description: "Domiciliazione su carta di credito",
    icon: CreditCard,
    category: "digital"
  },
  { 
    value: "04", 
    label: "Pre-filled bulletin", 
    description: "Bollettino precompilato",
    icon: FileText,
    category: "traditional"
  },
  { 
    value: "99", 
    label: "Other", 
    description: "Specify custom payment method below",
    icon: MoreHorizontal,
    category: "other"
  },
];

const commonCombinations = [
  {
    name: "Digital payments",
    methods: ["01", "03"],
    description: "Bank & credit card",
    icon: Wallet,
  },
  {
    name: "Traditional payments",
    methods: ["02", "04"],
    description: "Postal & bulletin",
    icon: FileText,
  },
  {
    name: "All standard methods",
    methods: ["01", "02", "03", "04"],
    description: "Accept all common payment types",
    icon: CreditCard,
  },
];

export function PaymentMethodsForm({ initialData, onSubmit }: PaymentMethodsFormProps) {
  const { updateFormData, formData } = useWizardStore();
  const [showDescription, setShowDescription] = useState(false);
  
  const form = useForm<PaymentMethodsData>({
    resolver: zodResolver(paymentMethodsSchema),
    defaultValues: {
      MODALITA_PAGAMENTO: [],
      DESCRIZIONE: "",
      ...initialData,
      ...(formData?.paymentMethods || {}),
    },
  });

  const watchedModalitaPagamento = form.watch('MODALITA_PAGAMENTO');
  const watchedDescrizione = form.watch('DESCRIZIONE');

  // Update show description state when MODALITA_PAGAMENTO changes
  useEffect(() => {
    setShowDescription(watchedModalitaPagamento.includes('99'));
  }, [watchedModalitaPagamento]);

  // Save form data to store on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData('paymentMethods', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const handleFormSubmit = (data: PaymentMethodsData) => {
    updateFormData('paymentMethods', data);
    onSubmit?.(data);
  };

  const characterCount = watchedDescrizione?.length || 0;
  const maxCharacters = 25;

  const handleQuickSelect = (methods: string[]) => {
    form.setValue('MODALITA_PAGAMENTO', methods as ("01" | "02" | "03" | "04" | "99")[]);
  };

  const digitalMethods = paymentOptions.filter(opt => opt.category === "digital");
  const traditionalMethods = paymentOptions.filter(opt => opt.category === "traditional");
  const otherMethods = paymentOptions.filter(opt => opt.category === "other");

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
            <p className="text-sm text-muted-foreground">
              Select all the payment methods customers can use for this offer. At least one selection is required.
            </p>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Select payment methods that align with your customer base. Digital methods are increasingly popular,
              while traditional methods remain important for certain demographics.
            </AlertDescription>
          </Alert>

          {/* Quick Selection Presets */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Quick Selection</p>
            <div className="flex flex-wrap gap-2">
              {commonCombinations.map((combo) => {
                const Icon = combo.icon;
                const isSelected = combo.methods.every(method => 
                  watchedModalitaPagamento.includes(method as "01" | "02" | "03" | "04" | "99")
                );
                return (
                  <Button
                    key={combo.name}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickSelect(combo.methods)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-3 w-3" />
                    {combo.name}
                  </Button>
                );
              })}
            </div>
          </div>

          <FormField
            control={form.control}
            name="MODALITA_PAGAMENTO"
            render={() => (
              <FormItem>
                <FormLabel>Available Payment Methods *</FormLabel>
                <FormDescription>
                  Check all methods that apply to this offer
                </FormDescription>
                
                <div className="space-y-6 mt-4">
                  {/* Digital Payment Methods */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Digital Methods</p>
                    </div>
                    <div className="space-y-3 pl-6">
                      {digitalMethods.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="MODALITA_PAGAMENTO"
                          render={({ field }) => {
                            const Icon = option.icon;
                            return (
                              <FormItem
                                key={option.value}
                                className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value as "01" | "02" | "03" | "04" | "99")}
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
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <FormLabel className="text-sm font-medium cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </div>
                                  <p id={`${option.value}-description`} className="text-sm text-muted-foreground">
                                    {option.description}
                                  </p>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Traditional Payment Methods */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Traditional Methods</p>
                    </div>
                    <div className="space-y-3 pl-6">
                      {traditionalMethods.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="MODALITA_PAGAMENTO"
                          render={({ field }) => {
                            const Icon = option.icon;
                            return (
                              <FormItem
                                key={option.value}
                                className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value as "01" | "02" | "03" | "04" | "99")}
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
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <FormLabel className="text-sm font-medium cursor-pointer">
                                      {option.label}
                                    </FormLabel>
                                  </div>
                                  <p id={`${option.value}-description`} className="text-sm text-muted-foreground">
                                    {option.description}
                                  </p>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Other Payment Methods */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-muted-foreground">Other Methods</p>
                    </div>
                    <div className="space-y-3 pl-6">
                      {otherMethods.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="MODALITA_PAGAMENTO"
                          render={({ field }) => {
                            const Icon = option.icon;
                            return (
                              <FormItem
                                key={option.value}
                                className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value as "01" | "02" | "03" | "04" | "99")}
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
                                  <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <FormLabel className="text-sm font-medium cursor-pointer">
                                      {option.label}
                                      {option.value === "99" && showDescription && (
                                        <span className="text-destructive ml-1">*</span>
                                      )}
                                    </FormLabel>
                                  </div>
                                  <p id={`${option.value}-description`} className="text-sm text-muted-foreground">
                                    {option.description}
                                  </p>
                                </div>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
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
                        Description for Other Payment Method <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormDescription>
                        Please describe the alternative payment method (max 25 characters)
                      </FormDescription>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="e.g., PayPal, Bitcoin, etc."
                            maxLength={maxCharacters}
                            aria-required={showDescription}
                            aria-describedby="description-character-count"
                          />
                          <div 
                            id="description-character-count"
                            className="absolute bottom-0 right-0 -mb-5 text-xs text-muted-foreground"
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

          {/* Selected Payment Methods Summary */}
          {watchedModalitaPagamento.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected payment methods:</p>
              <div className="flex flex-wrap gap-2">
                {watchedModalitaPagamento.map((methodValue) => {
                  const method = paymentOptions.find(opt => opt.value === methodValue);
                  if (!method) return null;
                  const Icon = method.icon;
                  return (
                    <Badge key={methodValue} variant="secondary" className="flex items-center gap-1">
                      <Icon className="h-3 w-3" />
                      {method.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" disabled={!form.formState.isValid}>
            Continue
          </button>
        </div>
      </form>
    </Form>
  );
} 