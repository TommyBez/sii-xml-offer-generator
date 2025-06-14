'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/it';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWizardStore } from '@/store/wizard-store';
import { offerValiditySchema, type OfferValidityData } from '@/schemas';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Extend dayjs with custom parse format plugin
dayjs.extend(customParseFormat);
dayjs.locale('it');

interface OfferValidityFormProps {
  initialData?: Partial<OfferValidityData>;
  onSubmit?: (data: OfferValidityData) => void;
}

export function OfferValidityForm({ initialData, onSubmit }: OfferValidityFormProps) {
  const { updateFormData, clearValidationErrors } = useWizardStore();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState({ hours: '00', minutes: '00', seconds: '00' });
  const [endTime, setEndTime] = useState({ hours: '23', minutes: '59', seconds: '59' });

  const form = useForm<OfferValidityData>({
    resolver: zodResolver(offerValiditySchema),
    defaultValues: initialData || {
      DATA_INIZIO: '',
      DATA_FINE: '',
    },
  });

  // Helper function to format date to Italian format
  const formatDateToItalian = (date: Date | undefined, time: { hours: string; minutes: string; seconds: string }): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}_${time.hours}:${time.minutes}:${time.seconds}`;
  };

  // Helper function to parse Italian date format
  const parseItalianDate = (dateStr: string): { date: Date; time: { hours: string; minutes: string; seconds: string } } | null => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})_(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return null;
    
    const [, day, month, year, hours, minutes, seconds] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return { date, time: { hours, minutes, seconds } };
  };

  // Initialize dates from initial data
  useEffect(() => {
    if (initialData?.DATA_INIZIO) {
      const parsed = parseItalianDate(initialData.DATA_INIZIO);
      if (parsed) {
        setStartDate(parsed.date);
        setStartTime(parsed.time);
      }
    }
    if (initialData?.DATA_FINE) {
      const parsed = parseItalianDate(initialData.DATA_FINE);
      if (parsed) {
        setEndDate(parsed.date);
        setEndTime(parsed.time);
      }
    }
  }, [initialData]);

  // Update form values when dates or times change
  useEffect(() => {
    const startValue = formatDateToItalian(startDate, startTime);
    const endValue = formatDateToItalian(endDate, endTime);
    
    if (startValue) {
      form.setValue('DATA_INIZIO', startValue);
    }
    if (endValue) {
      form.setValue('DATA_FINE', endValue);
    }
  }, [startDate, endDate, startTime, endTime, form]);

  const handleSubmit = (data: OfferValidityData) => {
    clearValidationErrors('offerValidity');
    updateFormData('offerValidity', data);
    onSubmit?.(data);
  };

  // Date range presets
  const handlePreset = (months: number) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const endDate = new Date(tomorrow);
    endDate.setMonth(endDate.getMonth() + months);
    endDate.setHours(23, 59, 59, 0);
    
    setStartDate(tomorrow);
    setEndDate(endDate);
    setStartTime({ hours: '00', minutes: '00', seconds: '00' });
    setEndTime({ hours: '23', minutes: '59', seconds: '59' });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-6">
          {/* Date Range Presets */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Quick Presets</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePreset(1)}
              >
                1 Month
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePreset(3)}
              >
                3 Months
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePreset(6)}
              >
                6 Months
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePreset(12)}
              >
                1 Year
              </Button>
            </div>
          </div>

          {/* Start Date */}
          <FormField
            control={form.control}
            name="DATA_INIZIO"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Start Date (DATA_INIZIO) <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>
                  Select the date and time when the offer becomes valid
                </FormDescription>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full sm:w-[240px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "dd/MM/yyyy", { locale: it }) : "Select date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        locale={it}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Time Inputs */}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={startTime.hours}
                      onChange={(e) => setStartTime({ ...startTime, hours: e.target.value.padStart(2, '0') })}
                      className="w-14 text-center"
                      placeholder="HH"
                    />
                    <span>:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={startTime.minutes}
                      onChange={(e) => setStartTime({ ...startTime, minutes: e.target.value.padStart(2, '0') })}
                      className="w-14 text-center"
                      placeholder="MM"
                    />
                    <span>:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={startTime.seconds}
                      onChange={(e) => setStartTime({ ...startTime, seconds: e.target.value.padStart(2, '0') })}
                      className="w-14 text-center"
                      placeholder="SS"
                    />
                  </div>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    readOnly
                    placeholder="DD/MM/YYYY_HH:MM:SS"
                    className="mt-2 font-mono text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* End Date */}
          <FormField
            control={form.control}
            name="DATA_FINE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  End Date (DATA_FINE) <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>
                  Select the date and time when the offer expires
                </FormDescription>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Date Picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full sm:w-[240px] justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "dd/MM/yyyy", { locale: it }) : "Select date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={(date) => date < (startDate || new Date())}
                        initialFocus
                        locale={it}
                      />
                    </PopoverContent>
                  </Popover>

                  {/* Time Inputs */}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={endTime.hours}
                      onChange={(e) => setEndTime({ ...endTime, hours: e.target.value.padStart(2, '0') })}
                      className="w-14 text-center"
                      placeholder="HH"
                    />
                    <span>:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={endTime.minutes}
                      onChange={(e) => setEndTime({ ...endTime, minutes: e.target.value.padStart(2, '0') })}
                      className="w-14 text-center"
                      placeholder="MM"
                    />
                    <span>:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={endTime.seconds}
                      onChange={(e) => setEndTime({ ...endTime, seconds: e.target.value.padStart(2, '0') })}
                      className="w-14 text-center"
                      placeholder="SS"
                    />
                  </div>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    readOnly
                    placeholder="DD/MM/YYYY_HH:MM:SS"
                    className="mt-2 font-mono text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Save and Continue
        </Button>
      </form>
    </Form>
  );
} 