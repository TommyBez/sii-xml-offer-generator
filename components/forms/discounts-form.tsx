'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { discountsSchema } from '@/schemas';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Percent } from 'lucide-react';
import { useWizardStore } from '@/store/wizard-store';
import { Label } from '@/components/ui/label';

// Component/Band codes
const componentBandCodes = [
  // Electricity components
  { value: '01', label: 'PCV', type: 'component', market: 'electricity' },
  { value: '02', label: 'PPE', type: 'component', market: 'electricity' },
  // Gas components
  { value: '03', label: 'P_TRA', type: 'component', market: 'gas' },
  { value: '04', label: 'P_STR', type: 'component', market: 'gas' },
  { value: '05', label: 'P_DIS', type: 'component', market: 'gas' },
  { value: '06', label: 'P_MIS', type: 'component', market: 'gas' },
  { value: '07', label: 'P_COT', type: 'component', market: 'gas' },
  { value: '09', label: 'C_RM', type: 'component', market: 'gas' },
  { value: '10', label: 'C_RT', type: 'component', market: 'gas' },
  // Electricity bands
  { value: '11', label: 'F1', type: 'band', market: 'electricity' },
  { value: '12', label: 'F2', type: 'band', market: 'electricity' },
  { value: '13', label: 'F3', type: 'band', market: 'electricity' },
  { value: '14', label: 'F4', type: 'band', market: 'electricity' },
  { value: '15', label: 'F5', type: 'band', market: 'electricity' },
  { value: '16', label: 'F6', type: 'band', market: 'electricity' },
  { value: '17', label: 'Peak', type: 'band', market: 'electricity' },
  { value: '18', label: 'OffPeak', type: 'band', market: 'electricity' },
];

// Discount types
const discountTypes = [
  { value: '01', label: 'Fixed discount', unit: 'fixed' },
  { value: '02', label: 'Power discount', unit: 'power' },
  { value: '03', label: 'Sales discount', unit: 'variable' },
  { value: '04', label: 'Discount on regulated price', unit: 'percentage' }
];

// Units of measure
const unitsOfMeasure = [
  { value: '01', label: '€/Year' },
  { value: '02', label: '€/kW' },
  { value: '03', label: '€/kWh' },
  { value: '04', label: '€/Sm³' },
  { value: '05', label: '€' },
  { value: '06', label: 'Percentage' }
];

// Application conditions
const applicationConditions = [
  { value: '01', label: 'Electronic billing' },
  { value: '02', label: 'Direct debit payment' },
  { value: '03', label: 'Electronic billing + Direct debit' },
  { value: '04', label: 'Contract web activation' },
  { value: '99', label: 'Other (specify)', requiresDescription: true }
];

// TypeScript interfaces
interface PrezzoSconto {
  TIPOLOGIA: string;
  VALIDO_DA?: number;
  VALIDO_FINO?: number;
  UNITA_MISURA: string;
  PREZZO: number;
}

interface CondizioneSconto {
  CONDIZIONE_APPLICAZIONE: string;
  DESCRIZIONE_CONDIZIONE?: string;
}

interface PeriodoValidita {
  DURATA?: number;
  VALIDO_FINO?: string;
  MESE_VALIDITA?: string[];
}

interface Sconto {
  NOME: string;
  DESCRIZIONE: string;
  CODICE_COMPONENTE_FASCIA?: string[];
  VALIDITA?: string;
  IVA_SCONTO: string;
  PeriodoValidita?: PeriodoValidita;
  Condizione: CondizioneSconto;
  PREZZISconto: PrezzoSconto[];
}



interface DiscountsFormProps {
  onSubmit: (data: z.infer<typeof discountsSchema>) => void;
}

// Component/Band Selector
function ComponentBandSelector({ 
  selected, 
  onChange, 
  marketType 
}: { 
  selected: string[]; 
  onChange: (codes: string[]) => void;
  marketType?: string;
}) {
  const filteredComponents = componentBandCodes.filter(c => {
    if (!marketType) return true;
    
    // Filter based on market type
    if (marketType === '01' && c.market === 'gas') {
      return false; // Hide gas components for electricity
    }
    if (marketType === '02' && c.market === 'electricity') {
      return false; // Hide electricity components/bands for gas
    }
    return true;
  });

  return (
    <div>
      <Label>Apply discount to components/bands (optional)</Label>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {filteredComponents.map(component => (
          <div key={component.value} className="flex items-center space-x-2">
            <Checkbox
              id={`component-${component.value}`}
              checked={selected.includes(component.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selected, component.value]);
                } else {
                  onChange(selected.filter(v => v !== component.value));
                }
              }}
            />
            <label
              htmlFor={`component-${component.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              <Badge variant={component.type === 'band' ? 'secondary' : 'default'}>
                {component.label}
              </Badge>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Validity Period Component
function ValiditySelector({
  useSimple,
  simpleValue,
  complexValue,
  onToggle,
  onSimpleChange,
  onComplexChange
}: {
  useSimple: boolean;
  simpleValue?: string;
  complexValue?: PeriodoValidita;
  onToggle: (useSimple: boolean) => void;
  onSimpleChange: (value: string) => void;
  onComplexChange: (value: PeriodoValidita) => void;
}) {
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <div className="space-y-4">
      <RadioGroup value={useSimple ? 'simple' : 'complex'} onValueChange={(v) => onToggle(v === 'simple')}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="simple" id="simple" />
          <label htmlFor="simple" className="cursor-pointer">Simple validity text</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="complex" id="complex" />
          <label htmlFor="complex" className="cursor-pointer">Structured validity period</label>
        </div>
      </RadioGroup>

      {useSimple ? (
        <FormItem>
          <FormLabel>Validity Description</FormLabel>
          <FormControl>
            <Textarea
              value={simpleValue || ''}
              onChange={(e) => onSimpleChange(e.target.value)}
              placeholder="Enter validity description"
              rows={3}
            />
          </FormControl>
        </FormItem>
      ) : (
        <div className="space-y-4">
          <FormItem>
            <FormLabel>Duration (months)</FormLabel>
            <FormControl>
              <Input
                type="number"
                value={complexValue?.DURATA || ''}
                onChange={(e) => onComplexChange({
                  ...complexValue,
                  DURATA: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder="Optional"
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Valid Until (MM/YYYY)</FormLabel>
            <FormControl>
              <Input
                value={complexValue?.VALIDO_FINO || ''}
                onChange={(e) => onComplexChange({
                  ...complexValue,
                  VALIDO_FINO: e.target.value
                })}
                placeholder="MM/YYYY"
                pattern="\d{2}/\d{4}"
              />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Specific Months</FormLabel>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {months.map(month => (
                <div key={month.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`month-${month.value}`}
                    checked={complexValue?.MESE_VALIDITA?.includes(month.value) || false}
                    onCheckedChange={(checked) => {
                      const currentMonths = complexValue?.MESE_VALIDITA || [];
                      const newMonths = checked
                        ? [...currentMonths, month.value]
                        : currentMonths.filter(m => m !== month.value);
                      onComplexChange({
                        ...complexValue,
                        MESE_VALIDITA: newMonths.length > 0 ? newMonths : undefined
                      });
                    }}
                  />
                  <label
                    htmlFor={`month-${month.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {month.label}
                  </label>
                </div>
              ))}
            </div>
          </FormItem>
        </div>
      )}
    </div>
  );
}

// Discount Conditions Component
function DiscountConditions({
  condition,
  onChange
}: {
  condition: CondizioneSconto;
  onChange: (condition: CondizioneSconto) => void;
}) {
  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Application Condition</FormLabel>
        <Select
          value={condition.CONDIZIONE_APPLICAZIONE}
          onValueChange={(value) => onChange({
            ...condition,
            CONDIZIONE_APPLICAZIONE: value
          })}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {applicationConditions.map(cond => (
              <SelectItem key={cond.value} value={cond.value}>
                {cond.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>

      {condition.CONDIZIONE_APPLICAZIONE === '99' && (
        <FormItem>
          <FormLabel>Condition Description</FormLabel>
          <FormControl>
            <Textarea
              value={condition.DESCRIZIONE_CONDIZIONE || ''}
              onChange={(e) => onChange({
                ...condition,
                DESCRIZIONE_CONDIZIONE: e.target.value
              })}
              placeholder="Describe the application condition"
              rows={3}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    </div>
  );
}

// Discount Prices Component
function DiscountPrices({
  prices,
  onChange
}: {
  prices: PrezzoSconto[];
  onChange: (prices: PrezzoSconto[]) => void;
}) {
  const addPrice = () => {
    onChange([...prices, {
      TIPOLOGIA: '',
      UNITA_MISURA: '',
      PREZZO: 0
    }]);
  };

  const updatePrice = (index: number, field: keyof PrezzoSconto, value: any) => {
    const newPrices = [...prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    onChange(newPrices);
  };

  const removePrice = (index: number) => {
    onChange(prices.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {prices.map((price, index) => (
        <Card key={index} className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <FormItem>
              <FormLabel>Discount Type</FormLabel>
              <Select
                value={price.TIPOLOGIA}
                onValueChange={(value) => updatePrice(index, 'TIPOLOGIA', value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {discountTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>Unit of Measure</FormLabel>
              <Select
                value={price.UNITA_MISURA}
                onValueChange={(value) => updatePrice(index, 'UNITA_MISURA', value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {unitsOfMeasure.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem>
              <FormLabel>Valid From (consumption)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={price.VALIDO_DA || ''}
                  onChange={(e) => updatePrice(index, 'VALIDO_DA', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Optional"
                />
              </FormControl>
            </FormItem>

            <FormItem>
              <FormLabel>Valid To (consumption)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={price.VALIDO_FINO || ''}
                  onChange={(e) => updatePrice(index, 'VALIDO_FINO', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="Optional"
                />
              </FormControl>
            </FormItem>

            <FormItem className="col-span-2">
              <FormLabel>Discount Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.000001"
                  value={price.PREZZO}
                  onChange={(e) => updatePrice(index, 'PREZZO', parseFloat(e.target.value) || 0)}
                  required
                />
              </FormControl>
              <FormDescription>Up to 6 decimal places</FormDescription>
            </FormItem>
          </div>

          {prices.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePrice(index)}
              className="mt-4"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Price
            </Button>
          )}
        </Card>
      ))}

      <Button
        type="button"
        onClick={addPrice}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Price Configuration
      </Button>
    </div>
  );
}

export function DiscountsForm({ onSubmit }: DiscountsFormProps) {
  const form = useFormContext();
  const formData = useWizardStore((state) => state.formData);
  const marketType = formData?.offerDetails?.TIPO_MERCATO;
  
  const [discounts, setDiscounts] = useState<Sconto[]>(() => {
    const saved = form.getValues('discounts');
    return saved && saved.length > 0 ? saved : [];
  });

  useEffect(() => {
    form.setValue('discounts', discounts);
  }, [discounts, form]);

  const addDiscount = () => {
    setDiscounts([...discounts, {
      NOME: '',
      DESCRIZIONE: '',
      IVA_SCONTO: '01',
      Condizione: {
        CONDIZIONE_APPLICAZIONE: ''
      },
      PREZZISconto: [{
        TIPOLOGIA: '',
        UNITA_MISURA: '',
        PREZZO: 0
      }]
    }]);
  };

  const updateDiscount = (index: number, field: keyof Sconto, value: any) => {
    const newDiscounts = [...discounts];
    newDiscounts[index] = { ...newDiscounts[index], [field]: value };
    setDiscounts(newDiscounts);
  };

  const removeDiscount = (index: number) => {
    setDiscounts(discounts.filter((_, i) => i !== index));
  };

  const toggleValidityType = (index: number, useSimple: boolean) => {
    const newDiscounts = [...discounts];
    if (useSimple) {
      delete newDiscounts[index].PeriodoValidita;
      newDiscounts[index].VALIDITA = '';
    } else {
      delete newDiscounts[index].VALIDITA;
      newDiscounts[index].PeriodoValidita = {};
    }
    setDiscounts(newDiscounts);
  };

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({ discounts: data.discounts || [] });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Percent className="h-6 w-6" />
            Discounts Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure discounts with validity periods, conditions, and pricing
          </p>
        </div>
        <Button type="button" onClick={addDiscount}>
          <Plus className="h-4 w-4 mr-2" />
          Add Discount
        </Button>
      </div>

      {discounts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Percent className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No discounts configured</p>
              <p className="text-sm mt-1">Click "Add Discount" to create your first discount</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {discounts.map((discount, discountIndex) => (
            <Card key={discountIndex} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">
                  Discount #{discountIndex + 1}
                  {discount.NOME && <Badge className="ml-2">{discount.NOME}</Badge>}
                </h3>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeDiscount(discountIndex)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="basic">
                  <AccordionTrigger>Basic Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`discounts.${discountIndex}.NOME`}
                        render={() => (
                          <FormItem>
                            <FormLabel>Discount Name</FormLabel>
                            <FormControl>
                              <Input
                                value={discount.NOME}
                                onChange={(e) => updateDiscount(discountIndex, 'NOME', e.target.value)}
                                maxLength={255}
                                placeholder="Enter discount name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`discounts.${discountIndex}.DESCRIZIONE`}
                        render={() => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                value={discount.DESCRIZIONE}
                                onChange={(e) => updateDiscount(discountIndex, 'DESCRIZIONE', e.target.value)}
                                maxLength={3000}
                                rows={4}
                                placeholder="Describe the discount"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <ComponentBandSelector
                        selected={discount.CODICE_COMPONENTE_FASCIA || []}
                        onChange={(codes) => updateDiscount(discountIndex, 'CODICE_COMPONENTE_FASCIA', codes)}
                        marketType={marketType}
                      />

                      <FormField
                        control={form.control}
                        name={`discounts.${discountIndex}.IVA_SCONTO`}
                        render={() => (
                          <FormItem>
                            <FormLabel>VAT Applicable</FormLabel>
                            <FormControl>
                              <RadioGroup
                                value={discount.IVA_SCONTO}
                                onValueChange={(value) => updateDiscount(discountIndex, 'IVA_SCONTO', value)}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="01" id={`vat-yes-${discountIndex}`} />
                                  <label htmlFor={`vat-yes-${discountIndex}`} className="cursor-pointer">
                                    Yes - VAT applies to discount
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="02" id={`vat-no-${discountIndex}`} />
                                  <label htmlFor={`vat-no-${discountIndex}`} className="cursor-pointer">
                                    No - VAT does not apply
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="validity">
                  <AccordionTrigger>Validity Period</AccordionTrigger>
                  <AccordionContent>
                    <ValiditySelector
                      useSimple={!discount.PeriodoValidita}
                      simpleValue={discount.VALIDITA}
                      complexValue={discount.PeriodoValidita}
                      onToggle={(useSimple) => toggleValidityType(discountIndex, useSimple)}
                      onSimpleChange={(value) => updateDiscount(discountIndex, 'VALIDITA', value)}
                      onComplexChange={(value) => updateDiscount(discountIndex, 'PeriodoValidita', value)}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="conditions">
                  <AccordionTrigger>Application Conditions</AccordionTrigger>
                  <AccordionContent>
                    <DiscountConditions
                      condition={discount.Condizione}
                      onChange={(condition) => updateDiscount(discountIndex, 'Condizione', condition)}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prices">
                  <AccordionTrigger>
                    Discount Prices
                    <Badge variant="outline" className="ml-2">
                      {discount.PREZZISconto.length} configured
                    </Badge>
                  </AccordionTrigger>
                  <AccordionContent>
                    <DiscountPrices
                      prices={discount.PREZZISconto}
                      onChange={(prices) => updateDiscount(discountIndex, 'PREZZISconto', prices)}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button type="submit" size="lg">
          Save Discounts
        </Button>
      </div>
    </form>
  );
} 