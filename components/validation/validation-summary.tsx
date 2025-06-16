'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ValidationError } from '@/lib/validation/validation-registry';
import { cn } from '@/lib/utils';

interface ValidationSummaryProps {
  errors: ValidationError[];
  groupBySection?: boolean;
  className?: string;
  title?: string;
}

// Helper to format section names
const formatSectionName = (section: string): string => {
  const sectionNames: Record<string, string> = {
    identification: 'Identification',
    offerDetails: 'Offer Details',
    offerCharacteristics: 'Offer Characteristics',
    activationMethods: 'Activation Methods',
    contactInformation: 'Contact Information',
    offerValidity: 'Offer Validity',
    paymentMethods: 'Payment Methods',
    regulatedComponents: 'Regulated Components',
    energyPriceReferences: 'Energy Price References',
    timeBands: 'Time Bands',
    dualOffers: 'Dual Fuel Offers',
    contractualConditions: 'Contractual Conditions',
    offerZones: 'Offer Zones',
    discounts: 'Discounts',
    additionalServices: 'Additional Services',
    electricityComponents: 'Electricity Components',
    general: 'General'
  };
  
  return sectionNames[section] || section
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({ 
  errors, 
  groupBySection = true,
  className,
  title = 'Validation Errors'
}) => {
  if (!errors || errors.length === 0) return null;

  // Group errors by section if requested
  const groupedErrors = groupBySection
    ? errors.reduce((acc, error) => {
        const section = error.path?.[0] || 'general';
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push(error);
        return acc;
      }, {} as Record<string, ValidationError[]>)
    : { all: errors };

  return (
    <Alert variant="destructive" className={cn("my-4", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-3">
          {Object.entries(groupedErrors).map(([section, sectionErrors]) => (
            <div key={section} className="space-y-1">
              {groupBySection && (
                <h4 className="font-semibold text-sm">
                  {formatSectionName(section)}
                </h4>
              )}
              <ul className="list-disc pl-5 space-y-1">
                {sectionErrors.map((error, idx) => (
                  <li key={`${section}-${idx}`} className="text-sm">
                    {error.field && groupBySection && (
                      <span className="font-medium">
                        {error.field.split('.').pop()}: 
                      </span>
                    )}{' '}
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Inline validation summary for specific sections
export const InlineValidationSummary: React.FC<{
  errors: ValidationError[];
  className?: string;
}> = ({ errors, className }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className={cn("rounded-md bg-destructive/10 p-3 mt-2", className)}>
      <div className="flex items-start space-x-2">
        <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
        <div className="flex-1 space-y-1">
          {errors.map((error, idx) => (
            <p key={idx} className="text-sm text-destructive">
              {error.message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}; 