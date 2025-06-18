'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { energyPriceReferencesSchema, type EnergyPriceReferencesData } from '@/schemas';
import { useWizardStepForm } from '@/hooks/use-wizard-step-form';
interface EnergyPriceReferencesFormProps {
  initialData?: Partial<EnergyPriceReferencesData>;
  onSubmit?: (data: EnergyPriceReferencesData) => void;
}

// Price indices data structure as per T07 specification
const priceIndices = {
  quarterly: [
    { value: "01", label: "PUN" },
    { value: "02", label: "TTF" },
    { value: "03", label: "PSV" },
    { value: "04", label: "Psbil" },
    { value: "05", label: "PE" },
    { value: "06", label: "Cmem" },
    { value: "07", label: "Pfor" },
  ],
  bimonthly: [
    { value: "08", label: "PUN" },
    { value: "09", label: "TTF" },
    { value: "10", label: "PSV" },
    { value: "11", label: "Psbil" },
  ],
  monthly: [
    { value: "12", label: "PUN" },
    { value: "13", label: "TTF" },
    { value: "14", label: "PSV" },
    { value: "15", label: "Psbil" },
    { value: "99", label: "Other (not in Portal)" },
  ],
};

export function EnergyPriceReferencesForm({ initialData, onSubmit }: EnergyPriceReferencesFormProps) {
  const { updateFormData, formData } = useWizardStore();
  
  const form = useForm<EnergyPriceReferencesData>({
    resolver: zodResolver(energyPriceReferencesSchema),
    defaultValues: {
      IDX_PREZZO_ENERGIA: "",
      ALTRO: "",
      ...initialData,
      ...(formData?.energyPriceReferences || {}),
    },
  });

  const selectedIndex = form.watch('IDX_PREZZO_ENERGIA');
  const showAlternativeDescription = selectedIndex === '99';
  
  // Save form data to store on change
  useEffect(() => {
    const subscription = form.watch((value: Partial<EnergyPriceReferencesData>) => {
      updateFormData('energyPriceReferences', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const handleFormSubmit = (data: EnergyPriceReferencesData) => {
    updateFormData('energyPriceReferences', data);
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Energy Price References</h3>
            <p className="text-sm text-gray-600">
              Select the price index for variable price offers. Different indices have different update frequencies.
            </p>
          </div>

          {/* Price Index Selection */}
          <FormField
            control={form.control}
            name="IDX_PREZZO_ENERGIA"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Index</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a price index" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Quarterly indices */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                      Quarterly
                    </div>
                    {priceIndices.quarterly.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    
                    {/* Bimonthly indices */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 mt-2">
                      Bimonthly
                    </div>
                    {priceIndices.bimonthly.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    
                    {/* Monthly indices */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 mt-2">
                      Monthly
                    </div>
                    {priceIndices.monthly.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.label}
                          {option.value === '99' && (
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the price index that will be used for variable pricing
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Warning for "Other" option */}
          {selectedIndex === '99' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Selecting &quot;Other&quot; will create a valid offer but it will not be visible in the Portal until the custom index is implemented.
              </AlertDescription>
            </Alert>
          )}

          {/* Alternative Index Description - Conditional */}
          {showAlternativeDescription && (
            <FormField
              control={form.control}
              name="ALTRO"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alternative Index Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the custom price index not managed by the Portal..."
                      className="resize-none"
                      rows={4}
                      {...field}
                      maxLength={3000}
                    />
                  </FormControl>
                  <FormDescription>
                    Index not managed by Portal - offer accepted but not visible until implemented ({field.value?.length || 0}/3000 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!form.formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}