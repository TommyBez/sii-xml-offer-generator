'use client';

import { useFormContext } from 'react-hook-form';
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
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

// Validation schema for identification information
export const identificationSchema = z.object({
  PIVA_UTENTE: z
    .string()
    .length(16, "VAT number must be exactly 16 characters")
    .regex(/^[A-Z0-9]+$/, "Only alphanumeric characters allowed")
    .describe("Italian VAT number"),
  COD_OFFERTA: z
    .string()
    .min(1, "Offer code is required")
    .max(32, "Maximum 32 characters allowed")
    .regex(/^[A-Z0-9]+$/, "Only alphanumeric characters allowed")
    .describe("Unique offer code"),
});

interface IdentificationFormProps {
  onSubmit: (data: z.infer<typeof identificationSchema>) => void;
}

export function IdentificationForm({ onSubmit }: IdentificationFormProps) {
  const form = useFormContext();
  const [isVatValid, setIsVatValid] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);

  // Watch field values for validation status
  const vatValue = form.watch('identification.PIVA_UTENTE');
  const codeValue = form.watch('identification.COD_OFFERTA');

  // Validate fields for showing checkmarks
  useEffect(() => {
    if (vatValue) {
      try {
        identificationSchema.shape.PIVA_UTENTE.parse(vatValue);
        setIsVatValid(true);
      } catch {
        setIsVatValid(false);
      }
    } else {
      setIsVatValid(false);
    }
  }, [vatValue]);

  useEffect(() => {
    if (codeValue) {
      try {
        identificationSchema.shape.COD_OFFERTA.parse(codeValue);
        setIsCodeValid(true);
      } catch {
        setIsCodeValid(false);
      }
    } else {
      setIsCodeValid(false);
    }
  }, [codeValue]);

  // Format VAT number for display (add visual separators)
  const formatVatDisplay = (value: string) => {
    if (!value) return '';
    // Format as: XXXX-XXXX-XXXX-XXXX
    const cleaned = value.replace(/[^A-Z0-9]/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join('-');
  };

  // Handle input transformation (auto-uppercase, remove spaces/special chars)
  const handleInputChange = (value: string, onChange: (value: string) => void) => {
    const transformed = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    onChange(transformed);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="identification.PIVA_UTENTE"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                VAT Number (Partita IVA)
                <span className="text-sm font-normal text-muted-foreground">Required *</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter your 16-character Italian VAT number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => handleInputChange(e.target.value, field.onChange)}
                    maxLength={16}
                    className={cn(
                      "pr-10 font-mono",
                      isVatValid && "border-green-500 focus:ring-green-500"
                    )}
                    aria-label="Italian VAT number"
                    aria-required="true"
                    aria-invalid={!!form.formState.errors.identification?.PIVA_UTENTE}
                  />
                  {isVatValid && (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                  )}
                </div>
              </FormControl>
              <FormDescription className="flex items-center justify-between">
                <span>Enter your 16-character Italian VAT number</span>
                {field.value && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatVatDisplay(field.value)}
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="identification.COD_OFFERTA"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                Offer Code
                <span className="text-sm font-normal text-muted-foreground">Required *</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Unique code used for contract subscriptions"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => handleInputChange(e.target.value, field.onChange)}
                    maxLength={32}
                    className={cn(
                      "pr-10 font-mono",
                      isCodeValid && "border-green-500 focus:ring-green-500"
                    )}
                    aria-label="Offer code"
                    aria-required="true"
                    aria-invalid={!!form.formState.errors.identification?.COD_OFFERTA}
                  />
                  {isCodeValid && (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                  )}
                </div>
              </FormControl>
              <FormDescription className="flex items-center justify-between">
                <span>Unique code used for contract subscriptions</span>
                {field.value && (
                  <span className="text-xs text-muted-foreground">
                    {field.value.length}/32 characters
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <h3 className="text-sm font-medium">Information</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>• Both fields are mandatory for creating an offer</li>
          <li>• Only uppercase letters and numbers are allowed</li>
          <li>• The VAT number must be exactly 16 characters</li>
          <li>• The offer code can be up to 32 characters</li>
        </ul>
      </div>
    </div>
  );
} 