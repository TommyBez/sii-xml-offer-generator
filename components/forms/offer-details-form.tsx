'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { offerDetailsSchema, type OfferDetailsData } from '@/schemas';
import { useWizardStepForm } from '@/hooks/use-wizard-step-form';
interface OfferDetailsFormProps {
  initialData?: Partial<OfferDetailsData>;
  onSubmit?: (data: OfferDetailsData) => void;
}

export function OfferDetailsForm({ initialData, onSubmit }: OfferDetailsFormProps) {
  const { updateFormData, formData } = useWizardStore();
  
  const form = useForm<OfferDetailsData>({
    resolver: zodResolver(offerDetailsSchema),
    defaultValues: {
      TIPO_MERCATO: "01",
      OFFERTA_SINGOLA: undefined,
      TIPO_CLIENTE: "",
      DOMESTICO_RESIDENTE: undefined,
      TIPO_OFFERTA: "01",
      TIPOLOGIA_ATT_CONTR: [],
      NOME_OFFERTA: "",
      DESCRIZIONE: "",
      DURATA: 12,
      GARANZIE: "NO",
      ...initialData,
      ...(formData?.offerDetails || {}),
    },
  });

  const marketType = form.watch('TIPO_MERCATO');
  const clientType = form.watch('TIPO_CLIENTE');
  
  // Save form data to store on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData('offerDetails', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  // Handle conditional field visibility
  const showSingleOffer = marketType !== '03';
  const showResidentStatus = clientType === '01';
  
  // Filter client type options based on market type
  const clientTypeOptions = useMemo(() => {
    const options = [
      { value: '01', label: 'Domestic' },
      { value: '02', label: 'Other Uses' },
    ];
    
    // Add residential condominium only for gas
    if (marketType === '02') {
      options.push({ value: '03', label: 'Residential Condominium' });
    }
    
    return options;
  }, [marketType]);

  const handleFormSubmit = (data: OfferDetailsData) => {
    updateFormData('offerDetails', data);
    onSubmit?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Market Type */}
        <FormField
          control={form.control}
          name="TIPO_MERCATO"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Market Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select market type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="01">Electricity</SelectItem>
                  <SelectItem value="02">Gas</SelectItem>
                  <SelectItem value="03">Dual Fuel</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the type of energy market for this offer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Single Offer - Conditional */}
        {showSingleOffer && (
          <FormField
            control={form.control}
            name="OFFERTA_SINGOLA"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Single Offer</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-x-6"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="SI" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="NO" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  Is this a single commodity offer?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Client Type */}
        <FormField
          control={form.control}
          name="TIPO_CLIENTE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clientTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Target client category for this offer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Residential Status - Conditional */}
        {showResidentStatus && (
          <FormField
            control={form.control}
            name="DOMESTICO_RESIDENTE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Residential Status (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select residential status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="01">Domestic Resident</SelectItem>
                    <SelectItem value="02">Domestic Non-Resident</SelectItem>
                    <SelectItem value="03">All types</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Specify the residential status if applicable
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Offer Type */}
        <FormField
          control={form.control}
          name="TIPO_OFFERTA"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Offer Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-2"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="01" />
                    </FormControl>
                    <FormLabel className="font-normal">Fixed Price</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="02" />
                    </FormControl>
                    <FormLabel className="font-normal">Variable Price</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="03" />
                    </FormControl>
                    <FormLabel className="font-normal">FLAT</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Pricing structure for this offer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Contract Activation Types */}
        <FormField
          control={form.control}
          name="TIPOLOGIA_ATT_CONTR"
          render={() => (
            <FormItem>
              <FormLabel>Contract Activation Types</FormLabel>
              <FormDescription>
                Select all applicable contract activation scenarios
              </FormDescription>
              <div className="space-y-2 mt-2">
                {[
                  { value: '01', label: 'Supplier Change' },
                  { value: '02', label: 'First Activation' },
                  { value: '03', label: 'Reactivation' },
                  { value: '04', label: 'Contract Transfer' },
                  { value: '99', label: 'Always' },
                ].map((item) => (
                  <FormField
                    key={item.value}
                    control={form.control}
                    name="TIPOLOGIA_ATT_CONTR"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.value)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.value])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.value
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Offer Name */}
        <FormField
          control={form.control}
          name="NOME_OFFERTA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter offer name"
                  {...field}
                  maxLength={255}
                />
              </FormControl>
              <FormDescription>
                Commercial name of the offer (max 255 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="DESCRIZIONE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter offer description..."
                  className="resize-none"
                  rows={4}
                  {...field}
                  maxLength={3000}
                />
              </FormControl>
              <FormDescription>
                Detailed description of the offer ({field.value?.length || 0}/3000 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration */}
        <FormField
          control={form.control}
          name="DURATA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (months)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter duration"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  min={-1}
                  max={99}
                />
              </FormControl>
              <FormDescription>
                Contract duration in months (-1 for indeterminate, 1-99 for fixed duration)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Guarantees */}
        <FormField
          control={form.control}
          name="GARANZIE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guarantees</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter guarantee details or 'NO' if none..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  maxLength={3000}
                />
              </FormControl>
              <FormDescription>
                Guarantee requirements ({field.value?.length || 0}/3000 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!form.formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
} 