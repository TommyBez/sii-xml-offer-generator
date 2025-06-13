'use client';

import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { useWizardStore } from '@/store/wizard-store';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Contact information schema
const contactSchema = z.object({
  TELEFONO: z
    .string()
    .min(1, 'Phone number is required')
    .max(15, 'Phone number cannot exceed 15 characters')
    .regex(/^[\d\s\+\-\(\)]+$/, 'Invalid phone format - only digits, spaces, +, -, and parentheses allowed')
    .transform((val) => val.replace(/\s/g, '')), // Remove spaces for storage
  URL_SITO_VENDITORE: z
    .string()
    .max(100, 'URL cannot exceed 100 characters')
    .refine(
      (val) => {
        if (!val) return true; // Allow empty
        try {
          // Add protocol if missing
          const url = val.startsWith('http://') || val.startsWith('https://') 
            ? val 
            : `https://${val}`;
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      'Invalid URL format'
    )
    .transform((val) => {
      if (!val) return val;
      // Add https:// if no protocol
      return val.startsWith('http://') || val.startsWith('https://') 
        ? val 
        : `https://${val}`;
    })
    .or(z.literal('')), // Allow empty
  URL_OFFERTA: z
    .string()
    .max(100, 'URL cannot exceed 100 characters')
    .refine(
      (val) => {
        if (!val) return true; // Allow empty
        try {
          // Add protocol if missing
          const url = val.startsWith('http://') || val.startsWith('https://') 
            ? val 
            : `https://${val}`;
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      'Invalid URL format'
    )
    .transform((val) => {
      if (!val) return val;
      // Add https:// if no protocol
      return val.startsWith('http://') || val.startsWith('https://') 
        ? val 
        : `https://${val}`;
    })
    .or(z.literal('')), // Allow empty
});

export type ContactInformationData = z.infer<typeof contactSchema>;

interface ContactInformationFormProps {
  initialData?: Partial<ContactInformationData>;
  onSubmit?: (data: ContactInformationData) => void;
}

// Phone number formatter
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  
  // Italian phone format: +39 02 1234 5678
  if (cleaned.startsWith('39')) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 $2 $3 $4');
  }
  
  // General international format
  if (cleaned.startsWith('1')) {
    // US format: +1 (555) 123-4567
    return cleaned.replace(/(\d)(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  
  // Default format with spaces every 3-4 digits
  if (cleaned.length > 10) {
    return cleaned.replace(/(\d{2,3})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4');
  }
  
  return value;
};

// Custom URL input with validation feedback
const URLInput = ({ field, placeholder, onCopy, ...props }: any) => {
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const validateURL = (url: string) => {
    if (!url) {
      setIsValid(false);
      return;
    }
    
    setIsValidating(true);
    try {
      // Add protocol if missing
      const fullUrl = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      new URL(fullUrl);
      setIsValid(true);
    } catch {
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      validateURL(field.value);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [field.value]);
  
  return (
    <div className="relative">
      <Input
        {...field}
        {...props}
        placeholder={placeholder}
        className="pr-20"
      />
      <div className="absolute right-2 top-2 flex items-center gap-1">
        {field.value && isValid && (
          <>
            <Check className="h-4 w-4 text-green-600" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onCopy(field.value)}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                const url = field.value.startsWith('http://') || field.value.startsWith('https://') 
                  ? field.value 
                  : `https://${field.value}`;
                window.open(url, '_blank');
              }}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export function ContactInformationForm({ initialData, onSubmit }: ContactInformationFormProps) {
  const { updateFormData, formData } = useWizardStore();
  const { toast } = useToast();
  
  const form = useForm<ContactInformationData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      TELEFONO: '',
      URL_SITO_VENDITORE: '',
      URL_OFFERTA: '',
      ...initialData,
      ...(formData?.contactInformation || {}),
    },
  });
  
  // Save form data to store on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData('contactInformation', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);
  
  const handleFormSubmit = (data: ContactInformationData) => {
    updateFormData('contactInformation', data);
    onSubmit?.(data);
  };
  
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'The URL has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handlePhoneFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formatted = formatPhoneNumber(value);
    form.setValue('TELEFONO', formatted);
  };
  
  const handlePaste = (field: any) => async (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // Clean up pasted URL
    let cleanedUrl = pastedText.trim();
    
    // Remove any surrounding quotes
    cleanedUrl = cleanedUrl.replace(/^["']|["']$/g, '');
    
    // Remove any whitespace
    cleanedUrl = cleanedUrl.replace(/\s/g, '');
    
    field.onChange(cleanedUrl);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <p className="text-sm text-muted-foreground">
            Provide customer service contact details and relevant URLs for your offer.
          </p>
        </div>
        
        {/* Phone Number */}
        <FormField
          control={form.control}
          name="TELEFONO"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Customer Service Phone Number <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="+39 02 1234 5678"
                  maxLength={15}
                  onChange={(e) => {
                    field.onChange(e);
                    handlePhoneFormat(e);
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter the customer service phone number (max 15 characters).
                Format: digits, spaces, +, -, and parentheses allowed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Vendor Website URL */}
        <FormField
          control={form.control}
          name="URL_SITO_VENDITORE"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor Website URL</FormLabel>
              <FormControl>
                <URLInput
                  field={field}
                  placeholder="www.example.com or https://www.example.com"
                  onCopy={handleCopy}
                  onPaste={handlePaste(field)}
                  maxLength={100}
                />
              </FormControl>
              <FormDescription>
                Enter your company website URL (max 100 characters).
                The https:// prefix will be added automatically if not provided.
                {field.value && (
                  <span className="block mt-1 text-xs">
                    Will be saved as: {field.value.startsWith('http') ? field.value : `https://${field.value}`}
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Offer URL */}
        <FormField
          control={form.control}
          name="URL_OFFERTA"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer Details URL</FormLabel>
              <FormControl>
                <URLInput
                  field={field}
                  placeholder="www.example.com/offer or https://www.example.com/offer"
                  onCopy={handleCopy}
                  onPaste={handlePaste(field)}
                  maxLength={100}
                />
              </FormControl>
              <FormDescription>
                Enter the specific URL for this offer's details (max 100 characters).
                The https:// prefix will be added automatically if not provided.
                {field.value && (
                  <span className="block mt-1 text-xs">
                    Will be saved as: {field.value.startsWith('http') ? field.value : `https://${field.value}`}
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
} 