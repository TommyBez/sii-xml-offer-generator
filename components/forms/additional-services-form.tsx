'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Trash2,
  Info,
  Package,
  FileText,
  Flame,
  Car,
  Sun,
  Zap,
  Wind,
  Shield,
  MoreHorizontal,
} from 'lucide-react';
import { additionalServicesSchema, type AdditionalServicesData } from '@/schemas';

interface AdditionalServicesFormProps {
  initialData?: AdditionalServicesData;
  onSubmit: (data: AdditionalServicesData) => void;
}

const macroAreas = [
  { value: '01', label: 'Boiler', icon: Flame, description: 'Boiler maintenance and repair services' },
  { value: '02', label: 'Mobility', icon: Car, description: 'Electric vehicle charging, car sharing' },
  { value: '03', label: 'Solar thermal', icon: Sun, description: 'Solar water heating systems' },
  { value: '04', label: 'Photovoltaic', icon: Zap, description: 'Solar electricity generation' },
  { value: '05', label: 'Air conditioning', icon: Wind, description: 'HVAC installation and maintenance' },
  { value: '06', label: 'Insurance policy', icon: Shield, description: 'Home and appliance insurance' },
  { value: '99', label: 'Other', icon: MoreHorizontal, description: 'Other products and services' }
];

const serviceTemplates = {
  '01': {
    name: 'Annual Boiler Maintenance',
    detail: 'Professional maintenance service including safety checks, cleaning, and efficiency optimization. 24/7 emergency support included.'
  },
  '02': {
    name: 'Home EV Charging Station',
    detail: 'Supply and installation of electric vehicle charging point. Compatible with all EV models. Smart charging features included.'
  },
  '04': {
    name: 'Solar Panel Installation',
    detail: 'Complete photovoltaic system design and installation. Includes inverter, monitoring system, and connection to grid.'
  },
  '06': {
    name: 'Home Appliance Protection',
    detail: 'Comprehensive insurance coverage for all major home appliances. Includes repair or replacement service.'
  }
};

export function AdditionalServicesForm({ initialData, onSubmit }: AdditionalServicesFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AdditionalServicesData>({
    resolver: zodResolver(additionalServicesSchema),
    defaultValues: {
      services: initialData?.services || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  const watchedServices = watch('services');

  const addService = () => {
    append({
      NOME: '',
      DETTAGLIO: '',
      MACROAREA: undefined,
      DETTAGLI_MACROAREA: undefined,
    });
  };

  const applyTemplate = (index: number, macroArea: string) => {
    const template = serviceTemplates[macroArea as keyof typeof serviceTemplates];
    if (template) {
      setValue(`services.${index}.NOME`, template.name);
      setValue(`services.${index}.DETTAGLIO`, template.detail);
      setValue(`services.${index}.MACROAREA`, macroArea);
    }
  };

  const groupedServices = fields.reduce((acc, _, index) => {
    const service = watchedServices[index];
    const area = service?.MACROAREA || 'uncategorized';
    if (!acc[area]) acc[area] = [];
    acc[area].push(service);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Additional Products & Services</h3>
          <p className="text-sm text-muted-foreground">
            Optional services to enhance your energy offer
          </p>
        </div>
        <Button type="button" onClick={addService} variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No additional services</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Add optional products and services to make your offer more attractive
            </p>
            <Button type="button" onClick={addService} variant="default">
              Add First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => {
            const service = watchedServices[index];
            const selectedMacroArea = macroAreas.find(m => m.value === service?.MACROAREA);
            const Icon = selectedMacroArea?.icon || Package;

            return (
              <Card key={field.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Service {index + 1}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Use Template
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {Object.entries(serviceTemplates).map(([key, template]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => applyTemplate(index, key)}
                            >
                              {template.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`services.${index}.NOME`}>
                      Service Name <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name={`services.${index}.NOME`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id={`services.${index}.NOME`}
                          placeholder="e.g., Annual boiler maintenance"
                          maxLength={255}
                          className={errors.services?.[index]?.NOME ? 'border-destructive' : ''}
                        />
                      )}
                    />
                    {errors.services?.[index]?.NOME && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.services[index].NOME.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`services.${index}.MACROAREA`}>
                        Category (Optional)
                      </Label>
                      <Controller
                        control={control}
                        name={`services.${index}.MACROAREA`}
                        render={({ field }) => (
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger id={`services.${index}.MACROAREA`}>
                              <SelectValue placeholder="Select category..." />
                            </SelectTrigger>
                            <SelectContent>
                              {macroAreas.map((area) => {
                                const AreaIcon = area.icon;
                                return (
                                  <SelectItem key={area.value} value={area.value}>
                                    <div className="flex items-center gap-2">
                                      <AreaIcon className="h-4 w-4" />
                                      {area.label}
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {service?.MACROAREA === '99' && (
                      <div>
                        <Label htmlFor={`services.${index}.DETTAGLI_MACROAREA`}>
                          Specify Category <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                          control={control}
                          name={`services.${index}.DETTAGLI_MACROAREA`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id={`services.${index}.DETTAGLI_MACROAREA`}
                              placeholder="Custom category name"
                              maxLength={100}
                              className={errors.services?.[index]?.DETTAGLI_MACROAREA ? 'border-destructive' : ''}
                            />
                          )}
                        />
                        {errors.services?.[index]?.DETTAGLI_MACROAREA && (
                          <p className="mt-1 text-sm text-destructive">
                            {errors.services[index].DETTAGLI_MACROAREA?.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`services.${index}.DETTAGLIO`}>
                      Service Details <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name={`services.${index}.DETTAGLIO`}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id={`services.${index}.DETTAGLIO`}
                          placeholder="Describe the service, benefits, and terms..."
                          rows={4}
                          maxLength={3000}
                          className={errors.services?.[index]?.DETTAGLIO ? 'border-destructive' : ''}
                        />
                      )}
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service?.DETTAGLIO?.length || 0}/3000 characters
                    </p>
                    {errors.services?.[index]?.DETTAGLIO && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.services[index].DETTAGLIO.message}
                      </p>
                    )}
                  </div>

                  {selectedMacroArea && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {selectedMacroArea.description}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Services Summary */}
          {fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Services Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(groupedServices).map(([area, areaServices]) => {
                    const areaInfo = macroAreas.find(m => m.value === area) || { label: 'Uncategorized', icon: Package };
                    const AreaIcon = areaInfo.icon;
                    return (
                      <div key={area} className="flex items-center gap-2 text-sm">
                        <AreaIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{areaInfo.label}:</span>
                        <Badge variant="secondary">{areaServices.length} services</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
} 