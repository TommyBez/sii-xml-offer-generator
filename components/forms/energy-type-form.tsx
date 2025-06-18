'use client';

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, Zap, Flame, PlugZap, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useWizardStepForm } from '@/hooks/use-wizard-step-form';

// Validation schema for energy type information
export const energyTypeSchema = z.object({
  TIPO_MERCATO: z
    .enum(['01', '02', '03'], {
      required_error: 'Market type selection is required',
    })
    .describe('Market type: 01 Electricity / 02 Gas / 03 Dual Fuel'),
  INCLUDE_GREEN_OPTIONS: z
    .boolean()
    .default(false)
    .describe('Whether to include green energy options'),
  AZIONE: z
    .enum(['INSERIMENTO', 'AGGIORNAMENTO'], {
      required_error: 'Action type is required',
    })
    .describe('Action type for file name generation'),
});

interface EnergyTypeFormProps {
  onSubmit?: (data: z.infer<typeof energyTypeSchema>) => void;
  initialData?: z.infer<typeof energyTypeSchema>;
}

const MARKET_TYPE_OPTIONS = [
  {
    value: '01',
    label: 'Electricity',
    description: 'Electric energy supply',
    icon: Zap,
    color: 'text-yellow-600',
  },
  {
    value: '02',
    label: 'Gas',
    description: 'Natural gas supply',
    icon: Flame,
    color: 'text-orange-600',
  },
  {
    value: '03',
    label: 'Dual Fuel',
    description: 'Combined electricity and gas package',
    icon: PlugZap,
    color: 'text-blue-600',
  },
];

const ACTION_TYPE_OPTIONS = [
  {
    value: 'INSERIMENTO',
    label: 'New Offer',
    description: 'Creating a new offer',
  },
  {
    value: 'AGGIORNAMENTO',
    label: 'Update Offer',
    description: 'Updating an existing offer',
  },
];

export function EnergyTypeForm({ onSubmit: externalOnSubmit, initialData }: EnergyTypeFormProps) {
  const form = useWizardStepForm<typeof energyTypeSchema>();
  const [isMarketTypeValid, setIsMarketTypeValid] = useState(false);
  const [isActionValid, setIsActionValid] = useState(false);

  // Watch field values for validation status
  const marketType = form.watch('TIPO_MERCATO');
  const includeGreenOptions = form.watch('INCLUDE_GREEN_OPTIONS');
  const actionType = form.watch('AZIONE');

  // Validate fields for showing checkmarks
  useEffect(() => {
    if (marketType) {
      try {
        energyTypeSchema.shape.TIPO_MERCATO.parse(marketType);
        setIsMarketTypeValid(true);
      } catch {
        setIsMarketTypeValid(false);
      }
    } else {
      setIsMarketTypeValid(false);
    }
  }, [marketType]);

  useEffect(() => {
    if (actionType) {
      try {
        energyTypeSchema.shape.AZIONE.parse(actionType);
        setIsActionValid(true);
      } catch {
        setIsActionValid(false);
      }
    } else {
      setIsActionValid(false);
    }
  }, [actionType]);

  const getMarketTypeIcon = (value: string) => {
    const option = MARKET_TYPE_OPTIONS.find(opt => opt.value === value);
    return option ? option.icon : Zap;
  };

  const getMarketTypeColor = (value: string) => {
    const option = MARKET_TYPE_OPTIONS.find(opt => opt.value === value);
    return option ? option.color : 'text-gray-600';
  };

  const handleSubmit = form.onSubmit(async (data) => {
    // Call external onSubmit if provided
    if (externalOnSubmit) {
      await externalOnSubmit(data);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Market Type Selection */}
          <FormField
            control={form.control}
            name="TIPO_MERCATO"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  Market Type
                  <span className="text-sm font-normal text-muted-foreground">Required *</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <div className="relative">
                      <SelectTrigger 
                        className={cn(
                          "pr-10",
                          isMarketTypeValid && "border-green-500 focus:ring-green-500"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {field.value && (
                            <>
                              {(() => {
                                const Icon = getMarketTypeIcon(field.value);
                                return <Icon className={cn("h-4 w-4", getMarketTypeColor(field.value))} />;
                              })()}
                            </>
                          )}
                          <SelectValue placeholder="Select the type of energy service" />
                        </div>
                      </SelectTrigger>
                      {isMarketTypeValid && (
                        <Check className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                      )}
                    </div>
                  </FormControl>
                  <SelectContent>
                    {MARKET_TYPE_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-4 w-4", option.color)} />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the commodity type that this offer targets
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Green Energy Options */}
          <FormField
            control={form.control}
            name="INCLUDE_GREEN_OPTIONS"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-600" />
                    Include Green Energy Options
                  </FormLabel>
                  <FormDescription>
                    Enable this option to include renewable energy add-ons in your offer.
                    This will make the Green Energy step visible in the wizard.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {/* Action Type */}
          <FormField
            control={form.control}
            name="AZIONE"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center justify-between">
                  Action Type
                  <span className="text-sm font-normal text-muted-foreground">Required *</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 gap-4 md:grid-cols-2"
                    >
                      {ACTION_TYPE_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label 
                            htmlFor={option.value} 
                            className="flex-1 cursor-pointer rounded-md border p-3 hover:bg-muted/50"
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {isActionValid && (
                      <Check className="absolute right-2 top-2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  This setting affects the generated XML file name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Information Panel */}
        <div className="rounded-lg bg-muted/50 p-4">
          <h3 className="text-sm font-medium">Information</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Market type determines which additional forms will be available</li>
            <li>• Green energy options enable renewable energy configurations</li>
            <li>• Action type is used for XML file naming conventions</li>
            <li>• Dual fuel offers require both electricity and gas configurations</li>
          </ul>
        </div>

        {/* Current Selection Summary */}
        {(marketType || actionType) && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium mb-3">Current Selection</h3>
            <div className="space-y-2 text-sm">
              {marketType && (
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = getMarketTypeIcon(marketType);
                    const option = MARKET_TYPE_OPTIONS.find(opt => opt.value === marketType);
                    return (
                      <>
                        <Icon className={cn("h-4 w-4", getMarketTypeColor(marketType))} />
                        <span className="font-medium">Market:</span>
                        <span>{option?.label}</span>
                      </>
                    );
                  })()}
                </div>
              )}
              {includeGreenOptions && (
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Green Options:</span>
                  <span>Enabled</span>
                </div>
              )}
              {actionType && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Action:</span>
                  <span>{ACTION_TYPE_OPTIONS.find(opt => opt.value === actionType)?.label}</span>
                </div>
              )}
            </div>
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