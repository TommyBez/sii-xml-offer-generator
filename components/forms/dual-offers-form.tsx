'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useWizardStepForm } from '@/hooks/use-wizard-step-form';

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
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

// Validation schema for dual offers
export const dualOffersSchema = z.object({
  OFFERTE_CONGIUNTE_EE: z
    .array(
      z
        .string()
        .max(32, "Maximum 32 characters")
        .regex(/^[A-Z0-9]+$/, "Only uppercase letters and numbers allowed")
        .min(1, "Offer code cannot be empty")
    )
    .min(1, "At least one electricity offer required")
    .refine(
      (codes) => {
        const uniqueCodes = new Set(codes);
        return uniqueCodes.size === codes.length;
      },
      { message: "Duplicate electricity offer codes are not allowed" }
    ),
  OFFERTE_CONGIUNTE_GAS: z
    .array(
      z
        .string()
        .max(32, "Maximum 32 characters")
        .regex(/^[A-Z0-9]+$/, "Only uppercase letters and numbers allowed")
        .min(1, "Offer code cannot be empty")
    )
    .min(1, "At least one gas offer required")
    .refine(
      (codes) => {
        const uniqueCodes = new Set(codes);
        return uniqueCodes.size === codes.length;
      },
      { message: "Duplicate gas offer codes are not allowed" }
    ),
});

interface DualOfferField {
  id: string;
  value: string;
}

interface DualOffersFormProps {
  onSubmit?: (data: z.infer<typeof dualOffersSchema>) => void;
  initialData?: z.infer<typeof dualOffersSchema>;
}

const DynamicOfferList = ({ 
  type, 
  fieldName,
  placeholder,
  description
}: { 
  type: 'Electricity' | 'Gas';
  fieldName: string;
  placeholder: string;
  description: string;
}) => {
  const { control, watch, setValue } = useFormContext();
  const existingValues = watch(fieldName) || [];
  
  // Initialize offers from form state
  const [offers, setOffers] = useState<DualOfferField[]>(() => {
    if (existingValues.length > 0) {
      return existingValues.map((value: string) => ({ id: uuidv4(), value }));
    }
    return [{ id: uuidv4(), value: '' }];
  });

  const addOffer = () => {
    setOffers([...offers, { id: uuidv4(), value: '' }]);
  };

  const removeOffer = (id: string) => {
    if (offers.length > 1) {
      const newOffers = offers.filter(o => o.id !== id);
      setOffers(newOffers);
      // Update form values
      const values = newOffers.map(o => o.value).filter(v => v !== '');
      setValue(fieldName, values);
    }
  };

  const updateOffer = (id: string, value: string) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const cleanedValue = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    const newOffers = offers.map(o => 
      o.id === id ? { ...o, value: cleanedValue } : o
    );
    setOffers(newOffers);
    
    // Update form values
    const values = newOffers.map(o => o.value).filter(v => v !== '');
    setValue(fieldName, values);
  };

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{type} Offer Codes</FormLabel>
          <FormDescription>
            {description}
          </FormDescription>
          <div className="space-y-2">
            {offers.map((offer, index) => (
              <div key={offer.id} className="flex gap-2">
                <FormControl>
                  <Input
                    value={offer.value}
                    onChange={(e) => updateOffer(offer.id, e.target.value)}
                    placeholder={`${placeholder} ${index + 1}`}
                    maxLength={32}
                    className={cn(
                      "uppercase font-mono",
                      fieldState.error && "border-red-500"
                    )}
                    pattern="[A-Z0-9]*"
                  />
                </FormControl>
                {offers.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeOffer(offer.id)}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              onClick={addOffer}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {type} Offer
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export function DualOffersForm({ onSubmit: externalOnSubmit, initialData }: DualOffersFormProps) {
  const form = useWizardStepForm<typeof dualOffersSchema>();

  const handleSubmit = form.onSubmit(async (data) => {
    // Call external onSubmit if provided
    if (externalOnSubmit) {
      await externalOnSubmit(data);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="rounded-lg border p-6 bg-muted/50">
          <h3 className="text-lg font-semibold mb-4">Linked Electricity Offers</h3>
          <DynamicOfferList
            type="Electricity"
            fieldName="OFFERTE_CONGIUNTE_EE"
            placeholder="Electricity offer code"
            description="List the electricity offer codes that are part of this dual fuel package. Each code can be up to 32 characters (letters and numbers only)."
          />
        </div>

        <div className="rounded-lg border p-6 bg-muted/50">
          <h3 className="text-lg font-semibold mb-4">Linked Gas Offers</h3>
          <DynamicOfferList
            type="Gas"
            fieldName="OFFERTE_CONGIUNTE_GAS"
            placeholder="Gas offer code"
            description="List the gas offer codes that are part of this dual fuel package. Each code can be up to 32 characters (letters and numbers only)."
          />
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> This section is only visible for dual fuel offers (TIPO_MERCATO = '03'). 
          You must specify at least one electricity and one gas offer code that make up this combined package.
        </p>
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