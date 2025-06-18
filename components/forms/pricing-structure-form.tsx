'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  Euro, 
  Plus, 
  Trash2, 
  Calculator, 
  Zap, 
  Flame, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { pricingStructureSchema } from '@/schemas';

interface PricingStructureFormProps {
  onSubmit?: (data: z.infer<typeof pricingStructureSchema>) => void;
}

// Unit of measure options based on market type
const UNIT_OPTIONS = {
  electricity: [
    { value: 'EUR_KWH', label: '€/kWh', description: 'Euro per kilowatt-hour' },
    { value: 'EUR_KW', label: '€/kW', description: 'Euro per kilowatt (power)' },
    { value: 'EUR_YEAR', label: '€/year', description: 'Euro per year (fixed)' },
  ],
  gas: [
    { value: 'EUR_SMC', label: '€/Sm³', description: 'Euro per standard cubic meter' },
    { value: 'EUR_YEAR', label: '€/year', description: 'Euro per year (fixed)' },
  ],
  dual: [
    { value: 'EUR_KWH', label: '€/kWh', description: 'Euro per kilowatt-hour (electricity)' },
    { value: 'EUR_SMC', label: '€/Sm³', description: 'Euro per standard cubic meter (gas)' },
    { value: 'EUR_KW', label: '€/kW', description: 'Euro per kilowatt (power)' },
    { value: 'EUR_YEAR', label: '€/year', description: 'Euro per year (fixed)' },
  ],
};

// Time band options for electricity
const TIME_BAND_OPTIONS = [
  { value: 'F1', label: 'F1 - Peak', description: 'Monday-Friday 8:00-19:00, Saturday 8:00-13:00' },
  { value: 'F2', label: 'F2 - Intermediate', description: 'Monday-Friday 7:00-8:00 and 19:00-23:00, Saturday 7:00-8:00 and 13:00-23:00' },
  { value: 'F3', label: 'F3 - Off-Peak', description: 'Monday-Friday 23:00-7:00, Saturday 23:00-7:00, Sunday and holidays all day' },
  { value: 'Peak', label: 'Peak Hours', description: 'Simplified peak period' },
  { value: 'OffPeak', label: 'Off-Peak Hours', description: 'Simplified off-peak period' },
];

// Default tier structure
const getDefaultTier = (marketType: string, index: number = 0) => ({
  DA_CONSUMO: index === 0 ? 0 : 1000 * index,
  A_CONSUMO: index === 0 ? 1000 : undefined,
  FASCIA: '',
  PREZZO: 0,
  UNITA_MISURA: marketType === '01' ? 'EUR_KWH' : marketType === '02' ? 'EUR_SMC' : 'EUR_KWH',
});

export function PricingStructureForm({ onSubmit: _onSubmit }: PricingStructureFormProps) {
  const form = useFormContext();
  const updateFormData = useWizardStore((state) => state.updateFormData);
  const formData = useWizardStore((state) => state.formData);
  
  // Get market type from energy type or offer details
  const marketType = formData.energyType?.TIPO_MERCATO || formData.offerDetails?.TIPO_MERCATO;
  const isElectricity = marketType === '01';
  const isGas = marketType === '02';
  
  // State for validation and preview
  const [isValid, setIsValid] = useState(false);
  const [previewConsumption, setPreviewConsumption] = useState<number>(2000);
  const [previewResult, setPreviewResult] = useState<{ tier: number; price: number; band?: string } | null>(null);
  
  // Field array for managing tiers
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'pricingStructure.tiers',
  });
  
  // Watch form values
  const tiers = form.watch('pricingStructure.tiers') || [];
  const priceType = form.watch('pricingStructure.TIPO_PREZZO');
  
  // Initialize with default tier if empty
  useEffect(() => {
    if (fields.length === 0 && marketType) {
      append(getDefaultTier(marketType, 0));
    }
  }, [fields.length, marketType, append]);
  
  // Validate form data
  useEffect(() => {
    if (tiers.length > 0 && priceType) {
      try {
        pricingStructureSchema.parse({
          tiers,
          TIPO_PREZZO: priceType,
        });
        setIsValid(true);
      } catch {
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
  }, [tiers, priceType]);
  
  // Update store when form data changes
  useEffect(() => {
    if (tiers.length > 0 || priceType) {
      updateFormData('pricingStructure', {
        tiers: tiers.filter((tier) => tier.PREZZO !== undefined),
        TIPO_PREZZO: priceType,
      });
    }
  }, [tiers, priceType, updateFormData]);
  
  // Calculate preview price
  useEffect(() => {
    if (tiers.length > 0 && previewConsumption > 0) {
      const sortedTiers = [...tiers]
        .filter((tier) => tier.DA_CONSUMO !== undefined && tier.PREZZO !== undefined)
        .sort((a, b) => a.DA_CONSUMO - b.DA_CONSUMO);
      
      for (let i = 0; i < sortedTiers.length; i++) {
        const tier = sortedTiers[i];
        const inRange = previewConsumption >= tier.DA_CONSUMO && 
          (tier.A_CONSUMO === undefined || previewConsumption <= tier.A_CONSUMO);
        
        if (inRange) {
          setPreviewResult({
            tier: i + 1,
            price: tier.PREZZO,
            band: tier.FASCIA || undefined,
          });
          return;
        }
      }
      setPreviewResult(null);
    }
  }, [tiers, previewConsumption]);
  
  // Add new tier
  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newTier = getDefaultTier(marketType, tiers.length);
    
    if (lastTier?.A_CONSUMO) {
      newTier.DA_CONSUMO = lastTier.A_CONSUMO;
    }
    
    append(newTier);
  };
  
  // Remove tier
  const handleRemoveTier = (index: number) => {
    if (tiers.length > 1) {
      remove(index);
    }
  };
  
  // Get unit options based on market type
  const getUnitOptions = () => {
    if (isElectricity) return UNIT_OPTIONS.electricity;
    if (isGas) return UNIT_OPTIONS.gas;
    return UNIT_OPTIONS.dual;
  };
  
  // Get market type configuration
  const getMarketConfig = () => {
    if (isElectricity) {
      return {
        label: 'Electricity Pricing',
        icon: Zap,
        color: 'text-yellow-600',
        unit: 'kWh',
      };
    } else if (isGas) {
      return {
        label: 'Gas Pricing',
        icon: Flame,
        color: 'text-orange-600',
        unit: 'Sm³',
      };
    } else {
      return {
        label: 'Dual Fuel Pricing',
        icon: Euro,
        color: 'text-blue-600',
        unit: 'kWh/Sm³',
      };
    }
  };
  
  const marketConfig = getMarketConfig();
  const Icon = marketConfig.icon;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', marketConfig.color)} />
            {marketConfig.label} Structure
          </CardTitle>
          <CardDescription>
            Configure tiered pricing based on consumption ranges and time bands
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Price Type Selection */}
          <FormField
            control={form.control}
            name="pricingStructure.TIPO_PREZZO"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="flex items-center justify-between">
                  Price Structure Type
                  <span className="text-sm font-normal text-muted-foreground">Required *</span>
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MONORARIO" id="monorario" />
                      <Label 
                        htmlFor="monorario" 
                        className="flex-1 cursor-pointer rounded-md border p-3 hover:bg-muted/50"
                      >
                        <div className="font-medium">Single Rate</div>
                        <div className="text-xs text-muted-foreground">
                          Same price regardless of time of day
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="MULTIORARIO" id="multiorario" />
                      <Label 
                        htmlFor="multiorario" 
                        className="flex-1 cursor-pointer rounded-md border p-3 hover:bg-muted/50"
                      >
                        <div className="font-medium">Multi-Rate</div>
                        <div className="text-xs text-muted-foreground">
                          Different prices per time band (F1, F2, F3)
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
      
      {/* Pricing Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Pricing Tiers
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTier}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Tier
            </Button>
          </CardTitle>
          <CardDescription>
            Define consumption ranges and their corresponding prices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Tier {index + 1}</h4>
                {tiers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTier(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Lower Bound */}
                <FormField
                  control={form.control}
                  name={`pricingStructure.tiers.${index}.DA_CONSUMO`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From ({marketConfig.unit})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Upper Bound */}
                <FormField
                  control={form.control}
                  name={`pricingStructure.tiers.${index}.A_CONSUMO`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To ({marketConfig.unit})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="∞ (unlimited)"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          min={0}
                        />
                      </FormControl>
                      <FormDescription>Leave empty for unlimited</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Time Band (for electricity multi-rate) */}
                {isElectricity && priceType === 'MULTIORARIO' && (
                  <FormField
                    control={form.control}
                    name={`pricingStructure.tiers.${index}.FASCIA`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Band</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select band" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_BAND_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div>
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {option.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Price */}
                <FormField
                  control={form.control}
                  name={`pricingStructure.tiers.${index}.PREZZO`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="0.000000"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          min={0}
                        />
                      </FormControl>
                      <FormDescription>Up to 6 decimal places</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Unit of Measure */}
                <FormField
                  control={form.control}
                  name={`pricingStructure.tiers.${index}.UNITA_MISURA`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getUnitOptions().map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {option.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Price Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Price Preview
          </CardTitle>
          <CardDescription>
            Test your pricing structure with sample consumption values
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="preview-consumption">
                Test Consumption ({marketConfig.unit})
              </Label>
              <Input
                id="preview-consumption"
                type="number"
                value={previewConsumption}
                onChange={(e) => setPreviewConsumption(Number(e.target.value) || 0)}
                min={0}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              {previewResult ? (
                <div className="rounded-lg border bg-green-50 p-3">
                  <div className="text-sm font-medium text-green-800">
                    Tier {previewResult.tier}
                    {previewResult.band && ` (${previewResult.band})`}
                  </div>
                  <div className="text-lg font-bold text-green-900">
                    {previewResult.price.toFixed(6)} €
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-orange-50 p-3">
                  <div className="text-sm font-medium text-orange-800">
                    No matching tier
                  </div>
                  <div className="text-xs text-orange-600">
                    Consumption outside defined ranges
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Validation Status */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          {isValid ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          )}
          <span className="font-medium">
            {isValid ? 'Pricing Structure Valid' : 'Validation Required'}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              tiers.length > 0 ? 'bg-green-500' : 'bg-gray-300'
            )} />
            At least one pricing tier defined
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              priceType ? 'bg-green-500' : 'bg-gray-300'
            )} />
            Price structure type selected
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              isValid ? 'bg-green-500' : 'bg-gray-300'
            )} />
            No gaps or overlaps in consumption ranges
          </div>
        </div>
      </div>
      
      {/* Information Panel */}
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4" />
          <h3 className="text-sm font-medium">Pricing Guidelines</h3>
        </div>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Consumption ranges must be consecutive with no gaps or overlaps</li>
          <li>• Prices support up to 6 decimal places for precision</li>
          <li>• Leave upper bound empty for unlimited consumption tier</li>
          <li>• Multi-rate pricing requires time band selection for electricity</li>
          <li>• Single-rate pricing applies the same price regardless of time</li>
        </ul>
      </div>
    </div>
  );
}