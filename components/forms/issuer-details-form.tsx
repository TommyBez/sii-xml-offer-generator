'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Building2, MapPin, Phone, Mail, FileText } from 'lucide-react';
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
import { issuerDetailsSchema, type IssuerDetailsData } from '@/schemas';
import { useWizardStore } from '@/store/wizard-store';

interface IssuerDetailsFormProps {
  initialData?: Partial<IssuerDetailsData>;
  onSubmit?: (data: IssuerDetailsData) => void;
}

export function IssuerDetailsForm({ initialData, onSubmit }: IssuerDetailsFormProps) {
  const { updateFormData, formData, markValid } = useWizardStore();
  const [validFields, setValidFields] = useState<Set<string>>(new Set());
  
  const form = useForm<IssuerDetailsData>({
    resolver: zodResolver(issuerDetailsSchema),
    mode: 'onChange',
    defaultValues: {
      DENOMINAZIONE: '',
      PIVA: '',
      INDIRIZZO_SEDE: '',
      CAP_SEDE: '',
      COMUNE_SEDE: '',
      PROVINCIA_SEDE: '',
      REA: '',
      PEC: '',
      TELEFONO: '',
      ...initialData,
      ...(formData?.issuerDetails || {}),
    },
  });

  // Watch all form values for validation
  const watchedValues = form.watch();
  
  // Update valid fields tracking - use JSON.stringify to avoid reference changes
  useEffect(() => {
    const newValidFields = new Set<string>();
    Object.keys(watchedValues).forEach((field) => {
      const fieldState = form.getFieldState(field as keyof IssuerDetailsData);
      if (!fieldState.error && watchedValues[field as keyof IssuerDetailsData]) {
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
      markValid('issuer-details', form.formState.isValid);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [form.formState.isValid, markValid]);

  // Save form data to store on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Debounce the updateFormData call
      const timeoutId = setTimeout(() => {
        updateFormData('issuerDetails', value);
      }, 300);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [updateFormData]);

  const handleFormSubmit = (data: IssuerDetailsData) => {
    updateFormData('issuerDetails', data);
    onSubmit?.(data);
  };

  const handleFieldChange = (field: keyof IssuerDetailsData, value: string) => {
    let processedValue = value;
    
    // Automatic uppercase conversion for specific fields
    if (field === 'PIVA' || field === 'REA' || field === 'PROVINCIA_SEDE') {
      processedValue = value.toUpperCase();
    }
    
    form.setValue(field, processedValue, { shouldValidate: true });
  };

  const FieldIcon = ({ isValid }: { isValid: boolean }) => (
    <AnimatePresence>
      {isValid && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <Check className="h-4 w-4 text-green-500" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600" />
          Issuer Details
        </h2>
        <p className="text-muted-foreground">
          Enter the legal and contact information for the company issuing the energy offer. 
          This information will be reused across multiple offers during your session.
        </p>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          This information will appear in the generated XML under the "SoggettoEmittente" node 
          and on the Offers Portal. Ensure all details are accurate and up to date.
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
                Legal company name and identification details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="DENOMINAZIONE"
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
                          onChange={(e) => handleFieldChange('DENOMINAZIONE', e.target.value)}
                        />
                        <FieldIcon isValid={validFields.has('DENOMINAZIONE')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Legal denomination as registered (max 255 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="PIVA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      VAT Number <Badge variant="destructive">Required</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter VAT number"
                          maxLength={16}
                          onChange={(e) => handleFieldChange('PIVA', e.target.value)}
                          className="uppercase"
                        />
                        <FieldIcon isValid={validFields.has('PIVA')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      11 or 16 alphanumeric characters (automatically converted to uppercase)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="REA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      REA Number <Badge variant="secondary">Optional</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter REA number"
                          maxLength={20}
                          onChange={(e) => handleFieldChange('REA', e.target.value)}
                          className="uppercase"
                        />
                        <FieldIcon isValid={validFields.has('REA')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Economic Administrative Register number (max 20 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Registered Office */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Registered Office
              </CardTitle>
              <CardDescription>
                Official registered office address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="INDIRIZZO_SEDE"
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
                          onChange={(e) => handleFieldChange('INDIRIZZO_SEDE', e.target.value)}
                        />
                        <FieldIcon isValid={validFields.has('INDIRIZZO_SEDE')} />
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
                  name="CAP_SEDE"
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
                              handleFieldChange('CAP_SEDE', value);
                            }}
                          />
                          <FieldIcon isValid={validFields.has('CAP_SEDE')} />
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
                  name="PROVINCIA_SEDE"
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
                            onChange={(e) => handleFieldChange('PROVINCIA_SEDE', e.target.value)}
                            className="uppercase"
                          />
                          <FieldIcon isValid={validFields.has('PROVINCIA_SEDE')} />
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
                name="COMUNE_SEDE"
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
                          onChange={(e) => handleFieldChange('COMUNE_SEDE', e.target.value)}
                        />
                        <FieldIcon isValid={validFields.has('COMUNE_SEDE')} />
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
                Phone and email contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="PEC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      PEC Email <Badge variant="destructive">Required</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="email"
                          placeholder="company@pec.example.com"
                          maxLength={100}
                          onChange={(e) => handleFieldChange('PEC', e.target.value)}
                        />
                        <FieldIcon isValid={validFields.has('PEC')} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Certified email address (PEC) for official communications (max 100 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="TELEFONO"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number <Badge variant="destructive">Required</Badge>
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
                      Contact phone number (max 15 characters, international format allowed)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Summary */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant={form.formState.isValid ? "default" : "secondary"}>
                {Object.keys(validFields).length}/8 fields completed
              </Badge>
              {form.formState.isValid && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-green-600"
                >
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">All required fields completed</span>
                </motion.div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </motion.div>
  );
} 