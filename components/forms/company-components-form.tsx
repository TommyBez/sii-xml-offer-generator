'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWizardStore } from '@/store/wizard-store';
import { cn } from '@/lib/utils';

// Type definitions
interface PeriodoValidita {
  DURATA?: number;
  VALIDO_FINO?: string;
  MESE_VALIDITA?: string[];
}

interface IntervalloPrezzi {
  FASCIA_COMPONENTE?: string;
  CONSUMO_DA?: number;
  CONSUMO_A?: number;
  PREZZO: number;
  UNITA_MISURA: string;
  PeriodoValidita?: PeriodoValidita;
}

interface ComponenteImpresa {
  NOME: string;
  DESCRIZIONE: string;
  TIPOLOGIA: '01' | '02';
  MACROAREA: string;
  IntervalloPrezzi: IntervalloPrezzi[];
}

// Macro area options
const MACRO_AREAS = [
  { value: '01', label: 'Fixed commercialization fee' },
  { value: '02', label: 'Energy commercialization fee' },
  { value: '04', label: 'Energy price component' },
  { value: '05', label: 'One-time fee' },
  { value: '06', label: 'Renewable/Green energy' },
];

// Unit of measure options
const UNITS_OF_MEASURE = [
  { value: '01', label: '€/Year' },
  { value: '02', label: '€/kW' },
  { value: '03', label: '€/kWh' },
  { value: '04', label: '€/Sm³' },
  { value: '05', label: '€' },
];

// Time band options
const TIME_BANDS = [
  { value: '01', label: 'Monorario/F1' },
  { value: '02', label: 'F2' },
  { value: '03', label: 'F3' },
  { value: '04', label: 'F23' },
  { value: '05', label: 'Bioraria' },
  { value: '06', label: 'Trioraria' },
  { value: '07', label: 'Multioraria' },
];

// Month options
const MONTHS = [
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

interface CompanyComponentsFormProps {
  marketType?: string;
  timeBandType?: string;
}

export function CompanyComponentsForm({ marketType = '01', timeBandType }: CompanyComponentsFormProps) {
  const { formData, updateFormData } = useWizardStore();
  const [components, setComponents] = useState<ComponenteImpresa[]>(
    formData.companyComponents || []
  );
  const [expandedComponents, setExpandedComponents] = useState<Set<number>>(new Set());
  const [expandedIntervals, setExpandedIntervals] = useState<Set<string>>(new Set());

  useEffect(() => {
    updateFormData('companyComponents', components);
  }, [components, updateFormData]);

  const toggleComponentExpanded = (index: number) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedComponents(newExpanded);
  };

  const toggleIntervalExpanded = (key: string) => {
    const newExpanded = new Set(expandedIntervals);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedIntervals(newExpanded);
  };

  const addComponent = () => {
    const newComponent: ComponenteImpresa = {
      NOME: '',
      DESCRIZIONE: '',
      TIPOLOGIA: '01',
      MACROAREA: '01',
      IntervalloPrezzi: [
        {
          PREZZO: 0,
          UNITA_MISURA: '01',
        },
      ],
    };
    setComponents([...components, newComponent]);
    // Auto-expand the new component
    setExpandedComponents(new Set([...expandedComponents, components.length]));
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
    // Remove from expanded set
    const newExpanded = new Set(expandedComponents);
    newExpanded.delete(index);
    setExpandedComponents(newExpanded);
  };

  const updateComponent = (index: number, field: keyof ComponenteImpresa, value: any) => {
    const newComponents = [...components];
    newComponents[index] = {
      ...newComponents[index],
      [field]: value,
    };
    setComponents(newComponents);
  };

  const addInterval = (componentIndex: number) => {
    const newComponents = [...components];
    newComponents[componentIndex].IntervalloPrezzi.push({
      PREZZO: 0,
      UNITA_MISURA: '01',
    });
    setComponents(newComponents);
  };

  const removeInterval = (componentIndex: number, intervalIndex: number) => {
    const newComponents = [...components];
    newComponents[componentIndex].IntervalloPrezzi = newComponents[
      componentIndex
    ].IntervalloPrezzi.filter((_, i) => i !== intervalIndex);
    setComponents(newComponents);
  };

  const updateInterval = (
    componentIndex: number,
    intervalIndex: number,
    field: keyof IntervalloPrezzi,
    value: any
  ) => {
    const newComponents = [...components];
    newComponents[componentIndex].IntervalloPrezzi[intervalIndex] = {
      ...newComponents[componentIndex].IntervalloPrezzi[intervalIndex],
      [field]: value,
    };
    setComponents(newComponents);
  };

  const updateValidityPeriod = (
    componentIndex: number,
    intervalIndex: number,
    field: keyof PeriodoValidita,
    value: any
  ) => {
    const newComponents = [...components];
    const interval = newComponents[componentIndex].IntervalloPrezzi[intervalIndex];
    if (!interval.PeriodoValidita) {
      interval.PeriodoValidita = {};
    }
    interval.PeriodoValidita[field] = value;
    setComponents(newComponents);
  };

  const shouldShowTimeBand = (macroArea: string, unitOfMeasure?: string) => {
    if (marketType !== '01') return false; // Only for electricity
    
    // Show for energy commercialization fee, energy price component, or renewable energy
    if (['02', '04', '06'].includes(macroArea)) {
      // If all intervals have kWh unit (03), show time bands
      return unitOfMeasure === '03';
    }
    return false;
  };

  const getRequiredIntervalsCount = () => {
    if (!timeBandType) return 1;
    
    const bandCounts: Record<string, number> = {
      '01': 1, // Monoraria
      '02': 2, // Bioraria  
      '03': 3, // Trioraria
      '04': 2, // F1 e F23
      '05': 3, // F1, F2, F3
    };
    
    return bandCounts[timeBandType] || 1;
  };

  const validateIntervals = (component: ComponenteImpresa): string | null => {
    if (marketType === '02') {
      // Gas: at least one interval required
      if (component.IntervalloPrezzi.length === 0) {
        return 'At least one price interval is required for gas offers';
      }
    } else if (marketType === '01') {
      // Electricity validation
      if (['02', '04', '06'].includes(component.MACROAREA)) {
        const allUnitsAreKWh = component.IntervalloPrezzi.every(
          (interval) => interval.UNITA_MISURA === '03'
        );
        
        if (allUnitsAreKWh) {
          const requiredCount = getRequiredIntervalsCount();
          if (component.IntervalloPrezzi.length !== requiredCount) {
            return `Exactly ${requiredCount} price interval(s) required for the selected time band type`;
          }
        }
      }
      
      if (['01', '04', '05', '06'].includes(component.MACROAREA)) {
        const hasNonKWhUnit = component.IntervalloPrezzi.some(
          (interval) => ['01', '02', '05'].includes(interval.UNITA_MISURA)
        );
        
        if (hasNonKWhUnit) {
          const intervalsWithoutBand = component.IntervalloPrezzi.filter(
            (interval) => !interval.FASCIA_COMPONENTE
          );
          
          if (intervalsWithoutBand.length !== 1) {
            return 'Exactly one price interval without time band is required';
          }
        }
      }
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Company Components</h3>
          <p className="text-sm text-muted-foreground">
            Define custom pricing components with price intervals and validity periods
          </p>
        </div>
        <Badge variant="outline">
          {components.length} component{components.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {marketType === '01' && (
        <Alert>
          <AlertDescription>
            <strong>Step-based pricing:</strong> Consumption ranges use step calculation. 
            For example, if Range 1 is 0-100 at €0.10 and Range 2 is 101-200 at €0.15, 
            a consumption of 150 would be: (100 × €0.10) + (50 × €0.15)
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {components.map((component, compIndex) => {
          const validationError = validateIntervals(component);
          const isExpanded = expandedComponents.has(compIndex);

          return (
            <Card key={compIndex} className="overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleComponentExpanded(compIndex)}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="text-left">
                        <h4 className="font-medium">
                          {component.NOME || `Component ${compIndex + 1}`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {component.TIPOLOGIA === '01' ? 'Standard' : 'Optional'} • {' '}
                          {MACRO_AREAS.find((ma) => ma.value === component.MACROAREA)?.label || 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {validationError && (
                        <Badge variant="destructive" className="text-xs">
                          Validation Error
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {component.IntervalloPrezzi.length} interval{component.IntervalloPrezzi.length !== 1 ? 's' : ''}
                      </Badge>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          removeComponent(compIndex);
                        }}
                        className="p-2 hover:bg-muted rounded-md cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 space-y-4 border-t">
                    {validationError && (
                      <Alert variant="destructive">
                        <AlertDescription>{validationError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`comp-name-${compIndex}`}>Component Name *</Label>
                        <Input
                          id={`comp-name-${compIndex}`}
                          value={component.NOME}
                          onChange={(e) => updateComponent(compIndex, 'NOME', e.target.value)}
                          placeholder="Enter component name"
                          maxLength={255}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`comp-type-${compIndex}`}>Type *</Label>
                        <Select
                          value={component.TIPOLOGIA}
                          onValueChange={(value) => updateComponent(compIndex, 'TIPOLOGIA', value as '01' | '02')}
                        >
                          <SelectTrigger id={`comp-type-${compIndex}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="01">Standard (Price Included)</SelectItem>
                            <SelectItem value="02">Optional (Price Not Included)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`comp-desc-${compIndex}`}>Description *</Label>
                      <Textarea
                        id={`comp-desc-${compIndex}`}
                        value={component.DESCRIZIONE}
                        onChange={(e) => updateComponent(compIndex, 'DESCRIZIONE', e.target.value)}
                        placeholder="Enter component description"
                        maxLength={255}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`comp-macro-${compIndex}`}>Macro Area *</Label>
                      <Select
                        value={component.MACROAREA}
                        onValueChange={(value) => updateComponent(compIndex, 'MACROAREA', value)}
                      >
                        <SelectTrigger id={`comp-macro-${compIndex}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MACRO_AREAS.map((area) => (
                            <SelectItem key={area.value} value={area.value}>
                              {area.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Price Intervals */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium">Price Intervals</h5>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addInterval(compIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Interval
                        </Button>
                      </div>

                      {component.IntervalloPrezzi.map((interval, intIndex) => {
                        const intervalKey = `${compIndex}-${intIndex}`;
                        const isIntervalExpanded = expandedIntervals.has(intervalKey);

                        return (
                          <Card key={intIndex} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h6 className="text-sm font-medium">
                                  Interval {intIndex + 1}
                                  {interval.FASCIA_COMPONENTE && (
                                    <span className="ml-2 text-muted-foreground">
                                      ({TIME_BANDS.find(tb => tb.value === interval.FASCIA_COMPONENTE)?.label})
                                    </span>
                                  )}
                                </h6>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeInterval(compIndex, intIndex)}
                                  disabled={component.IntervalloPrezzi.length === 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {shouldShowTimeBand(component.MACROAREA, interval.UNITA_MISURA) && (
                                  <div className="space-y-2">
                                    <Label>Time Band</Label>
                                    <Select
                                      value={interval.FASCIA_COMPONENTE || ''}
                                      onValueChange={(value) =>
                                        updateInterval(compIndex, intIndex, 'FASCIA_COMPONENTE', value)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select band" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {TIME_BANDS.map((band) => (
                                          <SelectItem key={band.value} value={band.value}>
                                            {band.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                <div className="space-y-2">
                                  <Label>From Consumption</Label>
                                  <Input
                                    type="number"
                                    value={interval.CONSUMO_DA || ''}
                                    onChange={(e) =>
                                      updateInterval(
                                        compIndex,
                                        intIndex,
                                        'CONSUMO_DA',
                                        e.target.value ? parseFloat(e.target.value) : undefined
                                      )
                                    }
                                    placeholder="0"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>To Consumption</Label>
                                  <Input
                                    type="number"
                                    value={interval.CONSUMO_A || ''}
                                    onChange={(e) =>
                                      updateInterval(
                                        compIndex,
                                        intIndex,
                                        'CONSUMO_A',
                                        e.target.value ? parseFloat(e.target.value) : undefined
                                      )
                                    }
                                    placeholder="100"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Price *</Label>
                                  <Input
                                    type="number"
                                    step="0.000001"
                                    value={interval.PREZZO}
                                    onChange={(e) =>
                                      updateInterval(
                                        compIndex,
                                        intIndex,
                                        'PREZZO',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    placeholder="0.000000"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Unit of Measure *</Label>
                                  <Select
                                    value={interval.UNITA_MISURA}
                                    onValueChange={(value) =>
                                      updateInterval(compIndex, intIndex, 'UNITA_MISURA', value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {UNITS_OF_MEASURE.map((unit) => (
                                        <SelectItem key={unit.value} value={unit.value}>
                                          {unit.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Validity Period (Collapsible) */}
                              <Collapsible
                                open={isIntervalExpanded}
                                onOpenChange={() => toggleIntervalExpanded(intervalKey)}
                              >
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="w-full justify-start">
                                    {isIntervalExpanded ? (
                                      <ChevronDown className="h-4 w-4 mr-2" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 mr-2" />
                                    )}
                                    Validity Period (Optional)
                                  </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Duration (Months)</Label>
                                        <Input
                                          type="number"
                                          value={interval.PeriodoValidita?.DURATA || ''}
                                          onChange={(e) =>
                                            updateValidityPeriod(
                                              compIndex,
                                              intIndex,
                                              'DURATA',
                                              e.target.value ? parseInt(e.target.value) : undefined
                                            )
                                          }
                                          placeholder="12"
                                        />
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Valid Until (MM/YYYY)</Label>
                                        <Input
                                          value={interval.PeriodoValidita?.VALIDO_FINO || ''}
                                          onChange={(e) =>
                                            updateValidityPeriod(
                                              compIndex,
                                              intIndex,
                                              'VALIDO_FINO',
                                              e.target.value
                                            )
                                          }
                                          placeholder="12/2025"
                                          pattern="[0-9]{2}/[0-9]{4}"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Valid Months</Label>
                                      <div className="grid grid-cols-3 gap-2">
                                        {MONTHS.map((month) => {
                                          const isSelected = interval.PeriodoValidita?.MESE_VALIDITA?.includes(
                                            month.value
                                          );
                                          return (
                                            <Button
                                              key={month.value}
                                              variant={isSelected ? 'default' : 'outline'}
                                              size="sm"
                                              onClick={() => {
                                                const currentMonths =
                                                  interval.PeriodoValidita?.MESE_VALIDITA || [];
                                                const newMonths = isSelected
                                                  ? currentMonths.filter((m) => m !== month.value)
                                                  : [...currentMonths, month.value];
                                                updateValidityPeriod(
                                                  compIndex,
                                                  intIndex,
                                                  'MESE_VALIDITA',
                                                  newMonths.length > 0 ? newMonths : undefined
                                                );
                                              }}
                                            >
                                              {month.label}
                                            </Button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      <Button onClick={addComponent} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Company Component
      </Button>
    </div>
  );
} 