'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Building2, MapPin, Phone, Mail, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { recipientDetailsSchema, type RecipientDetailsData } from '@/schemas';
import { useWizardStore } from '@/store/wizard-store';

interface RecipientDetailsFormProps {
  initialData?: Partial<RecipientDetailsData>;
  onSubmit?: (data: RecipientDetailsData) => void;
}

// Validation check icon component
const FieldIcon = ({ isValid }: { isValid: boolean }) => (
  <AnimatePresence>
    {isValid && (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        <Check className="h-4 w-4 text-green-500" />
      </motion.div>
    )}
  </AnimatePresence>
);

export function RecipientDetailsForm({ initialData, onSubmit }: RecipientDetailsFormProps) {
  const { updateFormData, formData, markValid } = useWizardStore();
  const [validFields, setValidFields] = useState<Set<string>>(new Set());
  
  const form = useForm<RecipientDetailsData>({
    resolver: zodResolver(recipientDetailsSchema),
    mode: 'onChange',
    defaultValues: {
      RAGIONE_SOCIALE: '',
      CODICE_FISCALE: '',
      INDIRIZZO: '',
      CAP: '',
      COMUNE: '',
      PROVINCIA: '',
      PARTITA_IVA: '',
      TELEFONO: '',
      ...initialData,
      ...(formData?.recipientDetails || {}),
    },
  });

  // Watch all form values for validation
  const watchedValues = form.watch();
  
  // Update valid fields tracking - use JSON.stringify to avoid reference changes
  useEffect(() => {
    const newValidFields = new Set<string>();
    Object.keys(watchedValues).forEach((field) => {
      const fieldState = form.getFieldState(field as keyof RecipientDetailsData);
      if (!fieldState.error && watchedValues[field as keyof RecipientDetailsData]) {
        newValidFields.add(field);
      }
    });
    
    // Only update if the actual valid fields have changed
    setValidFields(prevValidFields => {
      const prevArray = Array.from(prevValidFields).sort();
      const newArray = Array.from(newValidFields).sort();
      if (JSON.stringify(prevArray) !== JSON.stringify(newArray)) {
        return newValidFields;
      }
      return prevValidFields;
    });
  }, [JSON.stringify(watchedValues)]);

  // Update wizard store validation state - debounced to avoid excessive calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      markValid('recipient-details', form.formState.isValid);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [form.formState.isValid, markValid]);

  // Save form data to store on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData({ recipientDetails: value });
    });
    return () => subscription.unsubscribe();
  }, [form.watch, updateFormData]);

  // Form field change handler
  const handleFieldChange = useCallback(
    (fieldName: keyof RecipientDetailsData, value: string) => {
      form.setValue(fieldName, value, { shouldValidate: true });
    },
    [form]
  );

  // Form submission handler
  const handleFormSubmit = (data: RecipientDetailsData) => {
    updateFormData({ recipientDetails: data });
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Recipient Details</h2>
        <p className="text-muted-foreground">
          Enter the customer/recipient company data (contraparte) that will be referenced in the contract and XML output.
        </p>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          This information will appear in the generated XML under the recipient section 
          and represents the customer or contracting party. Ensure all details are accurate and current.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Legal company name and fiscal identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="RAGIONE_SOCIALE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Company Name <Badge variant="destructive">Required</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter company legal name"
                          maxLength={255}
                          onChange={(e) => handleFieldChange('RAGIONE_SOCIALE', e.target.value)}
                        />
                        <FieldIcon isValid={validFields.has('RAGIONE_SOCIALE')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Legal company name as registered (max 255 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="CODICE_FISCALE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Fiscal Code <Badge variant="destructive">Required</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter fiscal code"
                          maxLength={16}
                          onChange={(e) => handleFieldChange('CODICE_FISCALE', e.target.value.toUpperCase())}
                          className="uppercase"
                        />
                        <FieldIcon isValid={validFields.has('CODICE_FISCALE')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      16 alphanumeric characters (automatically converted to uppercase)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="PARTITA_IVA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      VAT Number <Badge variant="secondary">Optional</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter VAT number"
                          maxLength={16}
                          onChange={(e) => handleFieldChange('PARTITA_IVA', e.target.value.toUpperCase())}
                          className="uppercase"
                        />
                        <FieldIcon isValid={validFields.has('PARTITA_IVA')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      11-16 alphanumeric characters (automatically converted to uppercase)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
              <CardDescription>
                Company registered address details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="INDIRIZZO"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Address <Badge variant="destructive">Required</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter street address"
                          maxLength={255}
                          onChange={(e) => handleFieldChange('INDIRIZZO', e.target.value)}
                        />
                        <FieldIcon isValid={validFields.has('INDIRIZZO')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Street name, number, and additional address details (max 255 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="CAP"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Postal Code <Badge variant="destructive">Required</Badge>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="12345"
                            maxLength={5}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              handleFieldChange('CAP', value);
                            }}
                          />
                          <FieldIcon isValid={validFields.has('CAP')} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        5-digit postal code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="PROVINCIA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Province <Badge variant="destructive">Required</Badge>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="MI"
                            maxLength={2}
                            onChange={(e) => handleFieldChange('PROVINCIA', e.target.value.toUpperCase())}
                            className="uppercase"
                          />
                          <FieldIcon isValid={validFields.has('PROVINCIA')} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        2-letter province code (e.g., MI for Milano)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="COMUNE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Municipality <Badge variant="destructive">Required</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter municipality name"
                          maxLength={255}
                          onChange={(e) => handleFieldChange('COMUNE', e.target.value)}
                        />
                        <FieldIcon isValid={validFields.has('COMUNE')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Municipality name (max 255 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Optional phone contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="TELEFONO"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number <Badge variant="secondary">Optional</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="+39 02 1234567"
                          maxLength={15}
                          onChange={(e) => handleFieldChange('TELEFONO', e.target.value)}
                        />
                        <FieldIcon isValid={validFields.has('TELEFONO')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Contact phone number (max 15 characters). Format: digits, spaces, +, -, and parentheses allowed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
} 