'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Power, 
  PowerOff, 
  LogOut, 
  Calendar, 
  AlertCircle, 
  MoreHorizontal, 
  Trash2,
  Plus,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Interface for contractual condition
export interface CondizioneContrattuale {
  TIPOLOGIA_CONDIZIONE: string;
  ALTRO?: string;
  DESCRIZIONE: string;
  LIMITANTE: "01" | "02";
}

// Condition types configuration
const conditionTypes = [
  { value: '01', label: 'Activation', icon: Power },
  { value: '02', label: 'Deactivation', icon: PowerOff },
  { value: '03', label: 'Withdrawal', icon: LogOut },
  { value: '04', label: 'Multi-year Offer', icon: Calendar },
  { 
    value: '05', 
    label: 'Early Withdrawal Charges', 
    icon: AlertCircle,
    note: 'Available from January 1, 2024',
    availableFrom: new Date('2024-01-01')
  },
  { value: '99', label: 'Other', icon: MoreHorizontal }
];

// Common condition templates
const conditionTemplates = {
  '01': {
    standard: "L'attivazione della fornitura avverrà entro [X] giorni lavorativi dalla ricezione della documentazione completa.",
    limiting: "L'attivazione è subordinata alla verifica positiva dei requisiti creditizi e al pagamento di un deposito cauzionale pari a [X] mensilità."
  },
  '02': {
    standard: "La disattivazione avverrà entro [X] giorni dalla richiesta, senza costi aggiuntivi.",
    limiting: "La disattivazione comporta il pagamento di una penale pari a [X] euro in caso di recesso anticipato."
  },
  '03': {
    standard: "Il cliente può recedere dal contratto in qualsiasi momento con preavviso di [X] giorni.",
    limiting: "In caso di recesso anticipato nei primi [X] mesi, il cliente dovrà corrispondere una penale pari a [X] euro."
  },
  '04': {
    standard: "L'offerta prevede un contratto di durata [X] anni con rinnovo automatico salvo disdetta.",
    limiting: "Il contratto ha durata vincolante di [X] anni. Il recesso anticipato comporta il pagamento delle mensilità rimanenti."
  },
  '05': {
    standard: "Non sono previsti costi di recesso anticipato.",
    limiting: "Il recesso anticipato comporta il pagamento di un corrispettivo pari a [X] euro per ogni anno di fornitura non completato."
  },
  '99': {
    standard: "",
    limiting: ""
  }
};

// Validation schema
export const contractualConditionsSchema = z
  .array(
    z
      .object({
        TIPOLOGIA_CONDIZIONE: z.string().min(1, "Condition type is required"),
        ALTRO: z.string().max(20).optional(),
        DESCRIZIONE: z.string().min(1, "Description is required").max(3000, "Description must not exceed 3000 characters"),
        LIMITANTE: z.enum(["01", "02"]),
      })
      .refine((data) => {
        // ALTRO required when type is '99'
        if (data.TIPOLOGIA_CONDIZIONE === "99" && !data.ALTRO) {
          return false;
        }
        // Early withdrawal charges only after 2024
        if (data.TIPOLOGIA_CONDIZIONE === "05") {
          return new Date() >= new Date("2024-01-01");
        }
        return true;
      }, {
        message: "Invalid condition configuration",
        path: ["TIPOLOGIA_CONDIZIONE"]
      })
  )
  .min(1, "At least one contractual condition is required");

interface ContractualConditionsFormProps {
  onSubmit?: (data: CondizioneContrattuale[]) => void;
}

export function ContractualConditionsForm({ onSubmit }: ContractualConditionsFormProps) {
  const form = useFormContext();
  const [conditions, setConditions] = useState<CondizioneContrattuale[]>([
    {
      TIPOLOGIA_CONDIZIONE: '01',
      DESCRIZIONE: '',
      LIMITANTE: '02'
    }
  ]);

  const isAfter2024 = () => new Date() >= new Date('2024-01-01');

  const addCondition = () => {
    setConditions([...conditions, {
      TIPOLOGIA_CONDIZIONE: '01',
      DESCRIZIONE: '',
      LIMITANTE: '02'
    }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      const newConditions = conditions.filter((_, i) => i !== index);
      setConditions(newConditions);
      // Update form data
      form.setValue('contractualConditions', newConditions);
    }
  };

  const updateCondition = (index: number, field: keyof CondizioneContrattuale, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = {
      ...newConditions[index],
      [field]: value
    };
    
    // Clear ALTRO field if condition type changes from '99'
    if (field === 'TIPOLOGIA_CONDIZIONE' && value !== '99' && newConditions[index].ALTRO) {
      delete newConditions[index].ALTRO;
    }
    
    setConditions(newConditions);
    // Update form data
    form.setValue('contractualConditions', newConditions);
  };

  const applyTemplate = (index: number, isLimiting: boolean) => {
    const condition = conditions[index];
    const template = conditionTemplates[condition.TIPOLOGIA_CONDIZIONE as keyof typeof conditionTemplates];
    if (template) {
      const templateText = isLimiting ? template.limiting : template.standard;
      updateCondition(index, 'DESCRIZIONE', templateText);
    }
  };

  const getConditionIcon = (type: string) => {
    const conditionType = conditionTypes.find(ct => ct.value === type);
    const Icon = conditionType?.icon || MoreHorizontal;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Contractual Conditions</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Specify terms and conditions for the offer
          </p>
        </div>
        <Badge variant="secondary">At least one required</Badge>
      </div>

      <div className="space-y-4">
        {conditions.map((condition, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getConditionIcon(condition.TIPOLOGIA_CONDIZIONE)}
                  <span className="font-medium">Condition {index + 1}</span>
                </div>
                {conditions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`contractualConditions.${index}.TIPOLOGIA_CONDIZIONE`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition Type</FormLabel>
                    <Select
                      value={condition.TIPOLOGIA_CONDIZIONE}
                      onValueChange={(value) => {
                        updateCondition(index, 'TIPOLOGIA_CONDIZIONE', value);
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditionTypes.map(type => {
                          const isDisabled = type.value === '05' && !isAfter2024();
                          return (
                            <SelectItem
                              key={type.value}
                              value={type.value}
                              disabled={isDisabled}
                            >
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                <span>{type.label}</span>
                                {type.note && (
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({type.note})
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {condition.TIPOLOGIA_CONDIZIONE === '99' && (
                <FormField
                  control={form.control}
                  name={`contractualConditions.${index}.ALTRO`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specify Other Type</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={condition.ALTRO || ''}
                          onChange={(e) => {
                            updateCondition(index, 'ALTRO', e.target.value);
                            field.onChange(e.target.value);
                          }}
                          maxLength={20}
                          placeholder="Enter condition type"
                        />
                      </FormControl>
                      <FormDescription>
                        Required when "Other" is selected
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name={`contractualConditions.${index}.DESCRIZIONE`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Condition Description</FormLabel>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => applyTemplate(index, false)}
                                className="h-8 text-xs"
                              >
                                Standard Template
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Apply standard non-limiting template
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => applyTemplate(index, true)}
                                className="h-8 text-xs"
                              >
                                Limiting Template
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Apply limiting condition template
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={condition.DESCRIZIONE}
                        onChange={(e) => {
                          updateCondition(index, 'DESCRIZIONE', e.target.value);
                          field.onChange(e.target.value);
                        }}
                        maxLength={3000}
                        rows={4}
                        placeholder="Enter detailed description of this condition..."
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>Detailed description of the contractual condition</span>
                      <span className={cn(
                        "text-xs",
                        condition.DESCRIZIONE.length > 2700 && "text-destructive"
                      )}>
                        {condition.DESCRIZIONE.length}/3000
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`contractualConditions.${index}.LIMITANTE`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Is this a limiting condition?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={condition.LIMITANTE}
                        onValueChange={(value) => {
                          updateCondition(index, 'LIMITANTE', value as "01" | "02");
                          field.onChange(value);
                        }}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="01" />
                          <label htmlFor="01" className="flex items-center gap-2 cursor-pointer">
                            <span>Yes - Limits customer rights</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  Limiting conditions restrict customer's ability to switch providers or withdraw from the contract
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="02" />
                          <label htmlFor="02" className="cursor-pointer">
                            No - Standard condition
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    {condition.LIMITANTE === "01" && (
                      <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            This condition will be highlighted as limiting customer rights and must be clearly disclosed
                          </p>
                        </div>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        onClick={addCondition}
        variant="outline"
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </Button>

      {/* Preview Section */}
      {conditions.some(c => c.DESCRIZIONE) && (
        <Card className="mt-6">
          <CardHeader>
            <h4 className="font-medium">Preview</h4>
            <p className="text-sm text-muted-foreground">
              How conditions will appear to customers
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conditions.filter(c => c.DESCRIZIONE).map((condition, index) => {
                const conditionType = conditionTypes.find(ct => ct.value === condition.TIPOLOGIA_CONDIZIONE);
                return (
                  <div key={index} className="border-l-2 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {conditionType?.label || condition.ALTRO || 'Other'}
                      </span>
                      {condition.LIMITANTE === "01" && (
                        <Badge variant="destructive" className="text-xs">
                          Limiting
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {condition.DESCRIZIONE}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 