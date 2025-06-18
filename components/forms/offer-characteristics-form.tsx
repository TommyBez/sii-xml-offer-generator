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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useWizardStepForm } from '@/hooks/use-wizard-step-form';

import { offerCharacteristicsSchema, type OfferCharacteristicsData } from '@/schemas';

interface OfferCharacteristicsFormProps {
  initialData?: Partial<OfferCharacteristicsData>;
  onSubmit?: (data: OfferCharacteristicsData) => void;
}

// Format large numbers with separators
const formatConsumption = (value: number): string => {
  return new Intl.NumberFormat('it-IT').format(value);
};

// Power input with decimal restriction
const PowerInput = ({ field, ...props }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string
    if (value === '') {
      field.onChange(undefined);
      return;
    }
    
    // Allow only one decimal place
    const regex = /^\d*\.?\d{0,1}$/;
    if (regex.test(value)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        field.onChange(numValue);
      }
    }
  };

  return (
    <Input 
      {...field}
      {...props}
      value={field.value ?? ''}
      onChange={handleChange}
      step="0.1"
    />
  );
};

export function OfferCharacteristicsForm({ initialData, onSubmit }: OfferCharacteristicsFormProps) {
  const { updateFormData, formData } = useWizardStore();
  
  // Get offer details from store to check conditional display
  const offerType = formData?.offerDetails?.TIPO_OFFERTA;
  const marketType = formData?.offerDetails?.TIPO_MERCATO;
  
  // Conditional display rules
  const isFlat = offerType === '03';
  const isElectricity = marketType === '01';
  const showConsumption = isFlat;
  const showPower = isElectricity;
  
  const form = useForm<OfferCharacteristicsData>({
    resolver: zodResolver(offerCharacteristicsSchema),
    defaultValues: {
      CONSUMO_MIN: undefined,
      CONSUMO_MAX: undefined,
      POTENZA_MIN: undefined,
      POTENZA_MAX: undefined,
      ...initialData,
      ...(formData?.offerCharacteristics || {}),
    },
    mode: 'onChange', // Enable validation on change
  });

  // Save form data to store on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData('offerCharacteristics', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const handleFormSubmit = (data: OfferCharacteristicsData) => {
    // Clean up data based on visibility rules
    const cleanedData: OfferCharacteristicsData = {};
    
    if (showConsumption) {
      cleanedData.CONSUMO_MIN = data.CONSUMO_MIN;
      cleanedData.CONSUMO_MAX = data.CONSUMO_MAX;
    }
    
    if (showPower) {
      cleanedData.POTENZA_MIN = data.POTENZA_MIN;
      cleanedData.POTENZA_MAX = data.POTENZA_MAX;
    }
    
    updateFormData('offerCharacteristics', cleanedData);
    onSubmit?.(cleanedData);
  };

  // Get the unit based on market type
  const getConsumptionUnit = () => {
    switch (marketType) {
      case '01': return 'kWh';
      case '02': return 'Sm³';
      case '03': return 'kWh/Sm³'; // Dual fuel
      default: return 'units';
    }
  };

  // If no fields should be shown, display a message
  if (!showConsumption && !showPower) {
    return (
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          No offer characteristics are required for this offer type.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Consumption Fields - Required for FLAT offers */}
        {showConsumption && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Consumption Limits</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Required for FLAT offers. Define the minimum and maximum consumption range.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="CONSUMO_MIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Minimum Consumption <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                            field.onChange(value);
                          }}
                          value={field.value ?? ''}
                          min={0}
                          max={999999999}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {getConsumptionUnit()}
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {field.value !== undefined && field.value > 0 && (
                        <span>Formatted: {formatConsumption(field.value)} {getConsumptionUnit()}/year</span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="CONSUMO_MAX"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Maximum Consumption <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                            field.onChange(value);
                          }}
                          value={field.value ?? ''}
                          min={0}
                          max={999999999}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          {getConsumptionUnit()}
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {field.value !== undefined && field.value > 0 && (
                        <span>Formatted: {formatConsumption(field.value)} {getConsumptionUnit()}/year</span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Power Fields - Optional for electricity offers */}
        {showPower && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Power Limits</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Optional for electricity offers. Define the minimum and maximum power range.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="POTENZA_MIN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Power (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PowerInput field={field} placeholder="0.0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          kW
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Power limit with one decimal place (e.g., 3.5 kW)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="POTENZA_MAX"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Power (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PowerInput field={field} placeholder="0.0" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          kW
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Power limit with one decimal place (e.g., 6.0 kW)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Visual range preview */}
        {(showConsumption || showPower) && (
          <div className="mt-6 space-y-2">
            {showConsumption && form.watch('CONSUMO_MIN') !== undefined && form.watch('CONSUMO_MAX') !== undefined && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Consumption Range:</strong> {formatConsumption(form.watch('CONSUMO_MIN') || 0)} - {formatConsumption(form.watch('CONSUMO_MAX') || 0)} {getConsumptionUnit()}/year
                </p>
              </div>
            )}
            
            {showPower && form.watch('POTENZA_MIN') !== undefined && form.watch('POTENZA_MAX') !== undefined && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Power Range:</strong> {form.watch('POTENZA_MIN')?.toFixed(1) || '0.0'} - {form.watch('POTENZA_MAX')?.toFixed(1) || '0.0'} kW
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={!form.formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
} 