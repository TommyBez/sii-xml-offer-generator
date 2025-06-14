'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useWizardStore } from '@/store/wizard-store';

// Time band options
const timeBandOptions = [
  { value: '01', label: 'Monorario', description: 'Single rate all hours' },
  { value: '02', label: 'F1, F2', description: 'Two time bands' },
  { value: '03', label: 'F1, F2, F3', description: 'Standard 3 bands (inheritable)' },
  { value: '04', label: 'F1, F2, F3, F4', description: 'Four time bands' },
  { value: '05', label: 'F1, F2, F3, F4, F5', description: 'Five time bands' },
  { value: '06', label: 'F1, F2, F3, F4, F5, F6', description: 'Six time bands' },
  { value: '07', label: 'Peak/OffPeak', description: 'Standard peak/off-peak (inheritable)' },
  { value: '91', label: 'Biorario (F1 / F2+F3)', description: 'F1 separate, F2+F3 combined' },
  { value: '92', label: 'Biorario (F2 / F1+F3)', description: 'F2 separate, F1+F3 combined' },
  { value: '93', label: 'Biorario (F3 / F1+F2)', description: 'F3 separate, F1+F2 combined' },
];

// Dispatching types
const dispatchingTypes = [
  { value: '01', label: 'Disp. del.111/06' },
  { value: '02', label: 'PD' },
  { value: '03', label: 'MSD' },
  { value: '13', label: 'DispBT', note: 'Only if vendor selects' },
  { value: '99', label: 'Altro', requiresValue: true },
];

// Days of the week
const weekDays = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

// Helper functions for time conversion
const timeToQuarterHour = (hour: number, minute: number): number => {
  return (hour * 4) + Math.floor(minute / 15) + 1;
};

const quarterHourToTime = (quarter: number): string => {
  const totalMinutes = (quarter - 1) * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Parse time bands from string format
const parseTimeBands = (value: string): Array<{ start: number; end: number; band: number }> => {
  if (!value) return [];
  
  const bands: Array<{ start: number; end: number; band: number }> = [];
  const parts = value.split(',');
  
  parts.forEach(part => {
    const match = part.match(/(\d+)-(\d+)/);
    if (match) {
      const start = parseInt(match[1]);
      const band = parseInt(match[2]);
      bands.push({ start, end: start, band });
    }
  });
  
  // Calculate end points
  for (let i = 0; i < bands.length - 1; i++) {
    bands[i].end = bands[i + 1].start - 1;
  }
  if (bands.length > 0) {
    bands[bands.length - 1].end = 96;
  }
  
  return bands;
};

// Convert bands to string format
const bandsToString = (bands: Array<{ start: number; end: number; band: number }>): string => {
  return bands.map(b => `${b.start}-${b.band}`).join(',');
};

// Validation schema
export const timeBandsSchema = z.object({
  TIPOLOGIA_FASCE: z.string().min(1, 'Time band type is required'),
  weeklyBands: z.record(z.string()).optional(),
  dispatchingComponents: z.array(z.object({
    TIPO_DISPACCIAMENTO: z.string(),
    VALORE_DISP: z.number().optional(),
    NOME: z.string(),
    DESCRIZIONE: z.string().optional(),
  })).optional(),
});

interface TimeBandsFormProps {
  onSubmit: (data: z.infer<typeof timeBandsSchema>) => void;
}

// Time band editor component
function TimeBandEditor({ 
  day, 
  value, 
  onChange, 
  maxBands 
}: { 
  day: string; 
  value: string; 
  onChange: (value: string) => void;
  maxBands: number;
}) {
  const [bands, setBands] = useState(() => parseTimeBands(value));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const updateBands = (newBands: Array<{ start: number; end: number; band: number }>) => {
    setBands(newBands);
    onChange(bandsToString(newBands));
  };

  const addBand = () => {
    if (bands.length >= 10) return;
    
    const lastEnd = bands.length > 0 ? bands[bands.length - 1].end : 0;
    if (lastEnd >= 96) return;
    
    const newBands = [...bands, { start: lastEnd + 1, end: 96, band: 1 }];
    updateBands(newBands);
  };

  const removeBand = (index: number) => {
    const newBands = bands.filter((_, i) => i !== index);
    updateBands(newBands);
  };

  const updateBandTime = (index: number, startQuarter: number) => {
    const newBands = [...bands];
    newBands[index].start = startQuarter;
    
    // Update end of previous band
    if (index > 0) {
      newBands[index - 1].end = startQuarter - 1;
    }
    
    // Sort and update
    newBands.sort((a, b) => a.start - b.start);
    updateBands(newBands);
  };

  const updateBandNumber = (index: number, bandNumber: number) => {
    const newBands = [...bands];
    newBands[index].band = bandNumber;
    updateBands(newBands);
  };

  return (
    <div className="space-y-3">
      <div className="font-medium">{day}</div>
      
      {/* Visual timeline */}
      <div className="relative h-12 bg-gray-100 rounded overflow-hidden">
        {bands.map((band, i) => (
          <div
            key={i}
            className={cn(
              'absolute h-full flex items-center justify-center text-xs font-medium cursor-pointer transition-colors',
              band.band <= 6 ? `bg-blue-${Math.min(band.band * 100, 600)}` : 
              band.band === 7 ? 'bg-orange-400' : 'bg-purple-400',
              'hover:opacity-80'
            )}
            style={{
              left: `${((band.start - 1) / 96) * 100}%`,
              width: `${((band.end - band.start + 1) / 96) * 100}%`
            }}
            onClick={() => setEditingIndex(editingIndex === i ? null : i)}
          >
            {band.band <= 6 ? `F${band.band}` : band.band === 7 ? 'Peak' : 'OffPeak'}
          </div>
        ))}
        
        {/* Hour markers */}
        {[0, 6, 12, 18, 24].map(hour => (
          <div
            key={hour}
            className="absolute top-0 bottom-0 border-l border-gray-300"
            style={{ left: `${(hour / 24) * 100}%` }}
          >
            <span className="absolute -bottom-5 -left-3 text-xs text-gray-500">
              {hour}:00
            </span>
          </div>
        ))}
      </div>
      
      {/* Band editor */}
      <div className="space-y-2 mt-8">
        {bands.map((band, index) => (
          <div key={index} className="flex items-center gap-2 p-2 border rounded">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Start</label>
                <Input
                  type="time"
                  value={quarterHourToTime(band.start)}
                  onChange={(e) => {
                    const [h, m] = e.target.value.split(':').map(Number);
                    updateBandTime(index, timeToQuarterHour(h, m));
                  }}
                  step={900} // 15 minutes
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">End</label>
                <Input
                  type="time"
                  value={quarterHourToTime(band.end)}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Band</label>
                <Select
                  value={band.band.toString()}
                  onValueChange={(v) => updateBandNumber(index, parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxBands }, (_, i) => i + 1).map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n <= 6 ? `F${n}` : n === 7 ? 'Peak' : 'OffPeak'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeBand(index)}
              disabled={bands.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBand}
          disabled={bands.length >= 10}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Time Period
        </Button>
      </div>
    </div>
  );
}

// Dispatching component editor
function DispatchingComponentEditor({
  components,
  onChange
}: {
  components: Array<{ TIPO_DISPACCIAMENTO: string; VALORE_DISP?: number; NOME: string; DESCRIZIONE?: string }>;
  onChange: (components: Array<{ TIPO_DISPACCIAMENTO: string; VALORE_DISP?: number; NOME: string; DESCRIZIONE?: string }>) => void;
}) {
  const addComponent = () => {
    onChange([...components, { TIPO_DISPACCIAMENTO: '', NOME: '' }]);
  };

  const updateComponent = (index: number, updates: Partial<typeof components[0]>) => {
    const newComponents = [...components];
    newComponents[index] = { ...newComponents[index], ...updates };
    onChange(newComponents);
  };

  const removeComponent = (index: number) => {
    onChange(components.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {components.map((component, index) => (
        <Card key={index}>
          <CardContent className="pt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Dispatching Type</FormLabel>
                  <Select
                    value={component.TIPO_DISPACCIAMENTO}
                    onValueChange={(v) => updateComponent(index, { TIPO_DISPACCIAMENTO: v })}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {dispatchingTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                          {type.note && <span className="text-muted-foreground ml-2">({type.note})</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>

                {component.TIPO_DISPACCIAMENTO === '99' && (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={component.VALORE_DISP || ''}
                        onChange={(e) => updateComponent(index, { VALORE_DISP: parseFloat(e.target.value) })}
                        placeholder="Enter value"
                      />
                    </FormControl>
                  </FormItem>
                )}
              </div>

              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    value={component.NOME}
                    onChange={(e) => updateComponent(index, { NOME: e.target.value })}
                    placeholder="Component name"
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Input
                    value={component.DESCRIZIONE || ''}
                    onChange={(e) => updateComponent(index, { DESCRIZIONE: e.target.value })}
                    placeholder="Component description"
                  />
                </FormControl>
              </FormItem>

              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeComponent(index)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Component
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addComponent}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Dispatching Component
      </Button>
    </div>
  );
}

export function TimeBandsForm({ onSubmit }: TimeBandsFormProps) {
  const form = useFormContext();
  const formData = useWizardStore((state) => state.formData);
  const [showWeeklyBands, setShowWeeklyBands] = useState(false);
  const [dispatchingComponents, setDispatchingComponents] = useState<Array<{
    TIPO_DISPACCIAMENTO: string;
    VALORE_DISP?: number;
    NOME: string;
    DESCRIZIONE?: string;
  }>>([]);

  // Check if this section should be visible
  const marketType = formData?.offerDetails?.TIPO_MERCATO;
  const offerType = formData?.offerDetails?.TIPO_OFFERTA;
  const isVisible = marketType === '01' && offerType !== '03';

  // Watch for TIPOLOGIA_FASCE changes
  const tipologiaFasce = form.watch('timeBands.TIPOLOGIA_FASCE');

  useEffect(() => {
    // Show weekly bands for specific types
    const requiresWeeklyBands = ['02', '04', '05', '06'].includes(tipologiaFasce);
    setShowWeeklyBands(requiresWeeklyBands);
  }, [tipologiaFasce]);

  const handleSubmit = form.handleSubmit((data) => {
    const formData = {
      TIPOLOGIA_FASCE: data.timeBands?.TIPOLOGIA_FASCE,
      weeklyBands: showWeeklyBands ? data.timeBands?.weeklyBands : undefined,
      dispatchingComponents: dispatchingComponents.length > 0 ? dispatchingComponents : undefined,
    };
    onSubmit(formData);
  });

  if (!isVisible) {
    return (
      <Alert>
        <AlertDescription>
          This section is only available for electricity offers (not FLAT type).
        </AlertDescription>
      </Alert>
    );
  }

  // Determine max bands based on selection
  const getMaxBands = () => {
    switch (tipologiaFasce) {
      case '02': return 2;
      case '04': return 4;
      case '05': return 5;
      case '06': return 6;
      default: return 8;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Time Band Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Band Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="timeBands.TIPOLOGIA_FASCE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Band Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-3"
                  >
                    {timeBandOptions.map(option => (
                      <div key={option.value} className="flex items-start space-x-3">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <label
                          htmlFor={option.value}
                          className="flex-1 cursor-pointer space-y-1"
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Weekly Time Bands Configuration */}
      {showWeeklyBands && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Time Bands Schedule</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure time bands for each day of the week. Maximum 10 transitions per day.
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {weekDays.map(day => (
                  <FormField
                    key={day.id}
                    control={form.control}
                    name={`timeBands.weeklyBands.${day.id}`}
                    render={({ field }) => (
                      <FormItem>
                        <TimeBandEditor
                          day={day.label}
                          value={field.value || '1-1'}
                          onChange={field.onChange}
                          maxBands={getMaxBands()}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Dispatching Components */}
      <Card>
        <CardHeader>
          <CardTitle>Dispatching Components</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure dispatching types for this offer.
          </p>
        </CardHeader>
        <CardContent>
          <DispatchingComponentEditor
            components={dispatchingComponents}
            onChange={setDispatchingComponents}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
} 