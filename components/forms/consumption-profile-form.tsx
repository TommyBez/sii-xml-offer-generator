'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { useWizardStore } from '@/store/wizard-store';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Flame, TrendingUp, Clock, Percent, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schema for consumption profile
export const consumptionProfileSchema = z.object({
  CONSUMO_ANNUO: z
    .number({
      required_error: 'Annual consumption is required',
      invalid_type_error: 'Annual consumption must be a number',
    })
    .int('Annual consumption must be a whole number')
    .min(1, 'Annual consumption must be at least 1')
    .max(9_999_999, 'Annual consumption cannot exceed 9,999,999'),
  
  RIPARTIZIONE_FASCE: z
    .object({
      F1: z.number().min(0).max(100),
      F2: z.number().min(0).max(100),
      F3: z.number().min(0).max(100),
    })
    .optional()
    .refine(
      (v: { F1: number; F2: number; F3: number } | undefined) => {
        if (!v) return true;
        const sum = v.F1 + v.F2 + v.F3;
        return Math.abs(sum - 100) < 0.01; // Allow for small floating point errors
      },
      {
        message: 'Time band percentages must sum to 100%',
      }
    ),
  
  PERCENTUALE_INVERNALE: z
    .number()
    .min(0, 'Winter percentage must be at least 0%')
    .max(100, 'Winter percentage cannot exceed 100%')
    .optional(),
});

interface ConsumptionProfileFormProps {
  onSubmit?: (data: z.infer<typeof consumptionProfileSchema>) => void;
}

// Consumption presets
const CONSUMPTION_PRESETS = {
  electricity: [
    { label: 'Low Usage', value: 2000, description: 'Small apartment, basic appliances' },
    { label: 'Medium Usage', value: 3500, description: 'Average family home' },
    { label: 'High Usage', value: 5500, description: 'Large home with electric heating' },
  ],
  gas: [
    { label: 'Low Usage', value: 800, description: 'Cooking and hot water only' },
    { label: 'Medium Usage', value: 1400, description: 'Heating and hot water' },
    { label: 'High Usage', value: 2200, description: 'Large home with gas heating' },
  ],
};

// Default time band distribution
const DEFAULT_TIME_BANDS = {
  F1: 33,
  F2: 33,
  F3: 34,
};

export function ConsumptionProfileForm({ onSubmit: _onSubmit }: ConsumptionProfileFormProps) {
  const form = useFormContext();
  const updateFormData = useWizardStore((state: any) => state.updateFormData);
  const formData = useWizardStore((state: any) => state.formData);
  
  // Get market type from energy type or offer details
  const marketType = formData.energyType?.TIPO_MERCATO || formData.offerDetails?.TIPO_MERCATO;
  const isElectricity = marketType === '01';
  const isGas = marketType === '02';
  const isDualFuel = marketType === '03';
  
  // State for validation status
  const [isConsumptionValid, setIsConsumptionValid] = useState(false);
  const [isDistributionValid, setIsDistributionValid] = useState(true); // Optional field
  const [showDistribution, setShowDistribution] = useState(false);
  
  // Watch form values
  const consumption = form.watch('consumptionProfile.CONSUMO_ANNUO');
  const distribution = form.watch('consumptionProfile.RIPARTIZIONE_FASCE');
  const winterPercentage = form.watch('consumptionProfile.PERCENTUALE_INVERNALE');
  
  // Validate consumption field
  useEffect(() => {
    if (consumption !== undefined && consumption !== null && consumption !== '') {
      try {
        consumptionProfileSchema.shape.CONSUMO_ANNUO.parse(Number(consumption));
        setIsConsumptionValid(true);
      } catch {
        setIsConsumptionValid(false);
      }
    } else {
      setIsConsumptionValid(false);
    }
  }, [consumption]);
  
  // Validate distribution if present
  useEffect(() => {
    if (distribution && showDistribution) {
      try {
        consumptionProfileSchema.shape.RIPARTIZIONE_FASCE.parse(distribution);
        setIsDistributionValid(true);
      } catch {
        setIsDistributionValid(false);
      }
    } else {
      setIsDistributionValid(true);
    }
  }, [distribution, showDistribution]);
  
  // Update store when form data changes
  useEffect(() => {
    const profileData: any = {};
    
    if (consumption !== undefined && consumption !== null && consumption !== '') {
      profileData.CONSUMO_ANNUO = Number(consumption);
    }
    
    if (distribution && showDistribution) {
      profileData.RIPARTIZIONE_FASCE = distribution;
    }
    
    if (winterPercentage !== undefined && winterPercentage !== null) {
      profileData.PERCENTUALE_INVERNALE = Number(winterPercentage);
    }
    
    if (Object.keys(profileData).length > 0) {
      updateFormData('consumptionProfile', profileData);
    }
  }, [consumption, distribution, winterPercentage, showDistribution, updateFormData]);
  
  // Handle preset selection
  const handlePresetSelect = (preset: { value: number }) => {
    form.setValue('consumptionProfile.CONSUMO_ANNUO', preset.value);
  };
  
  // Handle distribution toggle
  const handleDistributionToggle = () => {
    if (!showDistribution) {
      // Initialize with default values
      form.setValue('consumptionProfile.RIPARTIZIONE_FASCE', DEFAULT_TIME_BANDS);
    } else {
      // Clear distribution
      form.setValue('consumptionProfile.RIPARTIZIONE_FASCE', undefined);
    }
    setShowDistribution(!showDistribution);
  };
  
  // Handle slider changes for time bands
  const handleSliderChange = (band: 'F1' | 'F2' | 'F3', value: number[]) => {
    const newValue = value[0];
    const currentDistribution = distribution || DEFAULT_TIME_BANDS;
    
    // Calculate remaining percentage to distribute
    const otherBands = Object.entries(currentDistribution).filter(([key]) => key !== band);
    const otherTotal = otherBands.reduce((sum: number, [, val]) => sum + (val as number), 0);
    const remaining = 100 - newValue;
    
    // Proportionally adjust other bands
    const newDistribution = { ...currentDistribution };
    newDistribution[band] = newValue;
    
    if (remaining > 0 && otherTotal > 0) {
      const factor = remaining / otherTotal;
      otherBands.forEach(([key, val]) => {
        newDistribution[key as keyof typeof newDistribution] = Math.round((val as number) * factor);
      });
      
      // Ensure total is exactly 100
      const actualTotal = (Object.values(newDistribution) as number[]).reduce((sum: number, val: number) => sum + val, 0);
      if (actualTotal !== 100) {
        const diff = 100 - actualTotal;
        const firstOtherBand = otherBands[0][0] as keyof typeof newDistribution;
        newDistribution[firstOtherBand] += diff;
      }
    }
    
    form.setValue('consumptionProfile.RIPARTIZIONE_FASCE', newDistribution);
  };
  
  // Get consumption unit and presets based on market type
  const getConsumptionConfig = () => {
    if (isElectricity) {
      return {
        unit: 'kWh',
        label: 'Annual Electricity Consumption',
        icon: Zap,
        presets: CONSUMPTION_PRESETS.electricity,
        color: 'text-yellow-600',
      };
    } else if (isGas) {
      return {
        unit: 'Sm³',
        label: 'Annual Gas Consumption',
        icon: Flame,
        presets: CONSUMPTION_PRESETS.gas,
        color: 'text-orange-600',
      };
    } else {
      return {
        unit: 'kWh/Sm³',
        label: 'Annual Consumption',
        icon: TrendingUp,
        presets: [],
        color: 'text-blue-600',
      };
    }
  };
  
  const consumptionConfig = getConsumptionConfig();
  const Icon = consumptionConfig.icon;
  
  return (
    <div className="space-y-6">
      {/* Annual Consumption */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', consumptionConfig.color)} />
            {consumptionConfig.label}
          </CardTitle>
          <CardDescription>
            Enter your typical annual consumption in {consumptionConfig.unit}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="consumptionProfile.CONSUMO_ANNUO"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  Annual Consumption ({consumptionConfig.unit})
                  <span className="text-sm font-normal text-muted-foreground">Required *</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder={`Enter consumption in ${consumptionConfig.unit}`}
                      {...field}
                      value={field.value || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                      className={cn(
                        'pr-20',
                        isConsumptionValid && 'border-green-500 focus:ring-green-500'
                      )}
                      min={1}
                      max={9999999}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{consumptionConfig.unit}</span>
                      {isConsumptionValid && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Maximum: 9,999,999 {consumptionConfig.unit}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Consumption Presets */}
          {consumptionConfig.presets.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Presets</p>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {consumptionConfig.presets.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(preset)}
                    className="h-auto p-3 text-left"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{preset.label}</span>
                        <Badge variant="secondary">{preset.value.toLocaleString()}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Time Band Distribution (Electricity only) */}
      {isElectricity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Time Band Distribution
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDistributionToggle}
              >
                {showDistribution ? 'Hide' : 'Configure'}
              </Button>
            </CardTitle>
            <CardDescription>
              Optional: Specify how your consumption is distributed across time bands (F1, F2, F3)
            </CardDescription>
          </CardHeader>
          
          {showDistribution && (
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="consumptionProfile.RIPARTIZIONE_FASCE"
                render={({ field }) => {
                  const currentDistribution = field.value || DEFAULT_TIME_BANDS;
                  
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Time Band Percentages
                      </FormLabel>
                      
                      <div className="space-y-4">
                        {/* F1 Peak Hours */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">F1 - Peak Hours</label>
                            <Badge variant="outline">{currentDistribution.F1}%</Badge>
                          </div>
                          <Slider
                            value={[currentDistribution.F1]}
                            onValueChange={(value) => handleSliderChange('F1', value)}
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Monday-Friday 8:00-19:00, Saturday 8:00-13:00
                          </p>
                        </div>
                        
                        {/* F2 Intermediate Hours */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">F2 - Intermediate Hours</label>
                            <Badge variant="outline">{currentDistribution.F2}%</Badge>
                          </div>
                          <Slider
                            value={[currentDistribution.F2]}
                            onValueChange={(value) => handleSliderChange('F2', value)}
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Monday-Friday 7:00-8:00 and 19:00-23:00, Saturday 7:00-8:00 and 13:00-23:00
                          </p>
                        </div>
                        
                        {/* F3 Off-Peak Hours */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">F3 - Off-Peak Hours</label>
                            <Badge variant="outline">{currentDistribution.F3}%</Badge>
                          </div>
                          <Slider
                            value={[currentDistribution.F3]}
                            onValueChange={(value) => handleSliderChange('F3', value)}
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Monday-Friday 23:00-7:00, Saturday 23:00-7:00, Sunday and holidays all day
                          </p>
                        </div>
                        
                        {/* Total Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total Distribution</span>
                            <Badge 
                              variant={isDistributionValid ? 'default' : 'destructive'}
                            >
                              {(currentDistribution.F1 + currentDistribution.F2 + currentDistribution.F3).toFixed(0)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={currentDistribution.F1 + currentDistribution.F2 + currentDistribution.F3}
                            className="h-2"
                          />
                          {!isDistributionValid && (
                            <p className="text-sm text-destructive">
                              Time band percentages must sum to 100%
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </CardContent>
          )}
        </Card>
      )}
      
      {/* Seasonal Distribution (Gas only) */}
      {isGas && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-orange-600" />
              Seasonal Distribution
            </CardTitle>
            <CardDescription>
              Optional: Specify winter consumption percentage (summer automatically calculated)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="consumptionProfile.PERCENTUALE_INVERNALE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Winter Consumption Percentage</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="60"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          className="pr-12"
                          min={0}
                          max={100}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                      
                      {field.value !== undefined && field.value !== null && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border p-3">
                            <div className="text-sm font-medium">Winter</div>
                            <div className="text-2xl font-bold text-orange-600">{field.value}%</div>
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="text-sm font-medium">Summer</div>
                            <div className="text-2xl font-bold text-blue-600">{100 - field.value}%</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Default is 60% winter, 40% summer. Range: 0-100%
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}
      
      {/* Information Panel */}
      <div className="rounded-lg bg-muted/50 p-4">
        <h3 className="text-sm font-medium mb-2">Information</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Annual consumption drives pricing tiers and discount eligibility</li>
          {isElectricity && (
            <li>• Time band distribution helps optimize pricing for your usage pattern</li>
          )}
          {isGas && (
            <li>• Seasonal distribution accounts for heating vs. non-heating months</li>
          )}
          <li>• This data is used to calculate estimated costs and recommend optimal offers</li>
        </ul>
      </div>
      
      {/* Current Profile Summary */}
      {consumption && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consumption Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Annual Consumption:</span>
              <Badge variant="secondary" className="text-base">
                {Number(consumption).toLocaleString()} {consumptionConfig.unit}
              </Badge>
            </div>
            
            {isElectricity && distribution && showDistribution && (
              <div className="space-y-2">
                <span className="font-medium">Time Band Distribution:</span>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-medium">F1 Peak</div>
                    <div className="text-muted-foreground">{distribution.F1}%</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">F2 Intermediate</div>
                    <div className="text-muted-foreground">{distribution.F2}%</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">F3 Off-Peak</div>
                    <div className="text-muted-foreground">{distribution.F3}%</div>
                  </div>
                </div>
              </div>
            )}
            
            {isGas && winterPercentage !== undefined && winterPercentage !== null && (
              <div className="flex items-center justify-between">
                <span className="font-medium">Seasonal Split:</span>
                <div className="text-sm">
                  {winterPercentage}% Winter / {100 - winterPercentage}% Summer
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}