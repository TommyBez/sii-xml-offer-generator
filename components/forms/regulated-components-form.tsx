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
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { regulatedComponentsSchema, type RegulatedComponentsData } from '@/schemas';
import { useWizardStore } from '@/store/wizard-store';
import { cn } from '@/lib/utils';

interface RegulatedComponentsFormProps {
  initialData?: Partial<RegulatedComponentsData>;
  onSubmit?: (data: RegulatedComponentsData) => void;
}

interface Component {
  value: string;
  label: string;
  description: string;
  category?: string;
}

const electricityComponents: Component[] = [
  { 
    value: '01', 
    label: 'PCV', 
    description: 'Prezzo Commercializzazione Vendita',
    category: 'Commercialization'
  },
  { 
    value: '02', 
    label: 'PPE', 
    description: 'Prezzo Perequazione Energia',
    category: 'Equalization'
  }
];

const gasComponents: Component[] = [
  { 
    value: '03', 
    label: 'CCR', 
    description: 'Corrispettivo Commercializzazione Retail',
    category: 'Commercialization'
  },
  { 
    value: '04', 
    label: 'CPR', 
    description: 'Corrispettivo Perequazione Retail',
    category: 'Equalization'
  },
  { 
    value: '05', 
    label: 'GRAD', 
    description: 'Gradualità',
    category: 'Regulatory'
  },
  { 
    value: '06', 
    label: 'QTint', 
    description: 'Quota Trasporto interno',
    category: 'Transport'
  },
  { 
    value: '07', 
    label: 'QTpsv', 
    description: 'Quota Trasporto PSV',
    category: 'Transport'
  },
  { 
    value: '09', 
    label: 'QVD_fissa', 
    description: 'Quota Vendita al Dettaglio fissa',
    category: 'Retail'
  },
  { 
    value: '10', 
    label: 'QVD_Variabile', 
    description: 'Quota Vendita al Dettaglio variabile',
    category: 'Retail'
  }
];

export function RegulatedComponentsForm({ initialData, onSubmit }: RegulatedComponentsFormProps) {
  const { updateFormData, formData } = useWizardStore();
  const [showDescriptions, setShowDescriptions] = useState(true);
  
  const form = useForm<RegulatedComponentsData>({
    resolver: zodResolver(regulatedComponentsSchema),
    defaultValues: {
      CODICE: [],
      ...initialData,
      ...(formData?.regulatedComponents || {}),
    },
  });

  // Get market type from form data
  const marketType = formData?.offerDetails?.TIPO_MERCATO;
  
  // Select components based on market type
  const components = marketType === '01' ? electricityComponents : 
                    marketType === '02' ? gasComponents : 
                    [];

  // Group components by category
  const groupedComponents = components.reduce((acc, component) => {
    const category = component.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(component);
    return acc;
  }, {} as Record<string, Component[]>);

  // Save form data to store on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateFormData('regulatedComponents', value);
    });
    return () => subscription.unsubscribe();
  }, [form, updateFormData]);

  const handleFormSubmit = (data: RegulatedComponentsData) => {
    updateFormData('regulatedComponents', data);
    onSubmit?.(data);
  };

  const selectedComponents = form.watch('CODICE') || [];

  const handleSelectAll = () => {
    form.setValue('CODICE', components.map(c => c.value), { shouldValidate: true });
  };

  const handleClearAll = () => {
    form.setValue('CODICE', [], { shouldValidate: true });
  };

  if (!marketType || marketType === '03') {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Please select a market type (Electricity or Gas) in the Offer Details section first.</p>
        <p className="text-sm mt-2">Note: This section is not available for Dual Fuel offers.</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Regulated Components</h3>
            <p className="text-sm text-muted-foreground">
              Select authority-defined price components to include (optional)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowDescriptions(!showDescriptions)}
            >
              {showDescriptions ? 'Hide' : 'Show'} Descriptions
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          </div>
        </div>

        <FormField
          control={form.control}
          name="CODICE"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-4">
                {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      {categoryComponents.map((component) => {
                        const isSelected = field.value?.includes(component.value) || false;
                        
                        return (
                          <div key={component.value}>
                            <label
                              htmlFor={`component-${component.value}`}
                              className="block cursor-pointer"
                            >
                              <Card
                                className={cn(
                                  "p-4 transition-all duration-200 hover:shadow-md",
                                  isSelected && "border-primary bg-primary/5 shadow-sm"
                                )}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 pr-2">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium">{component.label}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {component.value}
                                      </Badge>
                                    </div>
                                    {showDescriptions && (
                                      <p className="text-sm text-muted-foreground">
                                        {component.description}
                                      </p>
                                    )}
                                  </div>
                                  <Checkbox
                                    id={`component-${component.value}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValue, component.value]);
                                      } else {
                                        field.onChange(currentValue.filter(v => v !== component.value));
                                      }
                                    }}
                                  />
                                </div>
                              </Card>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedComponents.length} component{selectedComponents.length !== 1 ? 's' : ''} selected
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Info className="w-4 h-4" />
            <span>Optional components based on commercial strategy</span>
          </div>
        </div>
      </form>
    </Form>
  );
} 