'use client';

import { useFormContext } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Validation schema for basic offer information
export const offerBasicSchema = z.object({
  offerNumber: z.string().min(1, 'Offer number is required'),
  date: z.date({
    required_error: 'Offer date is required',
  }),
  validUntil: z.date({
    required_error: 'Valid until date is required',
  }),
  currency: z.string().min(3).max(3, 'Currency must be 3 characters (e.g., EUR)'),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.validUntil > data.date, {
  message: 'Valid until date must be after offer date',
  path: ['validUntil'],
});

interface OfferBasicFormProps {
  onSubmit: (data: z.infer<typeof offerBasicSchema>) => void;
}

export function OfferBasicForm({ onSubmit }: OfferBasicFormProps) {
  const form = useFormContext();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="offer-basic.offerNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer Number</FormLabel>
              <FormControl>
                <Input 
                  placeholder="OFF-2024-001" 
                  {...field} 
                  value={field.value || ''} // Ensure controlled input
                />
              </FormControl>
              <FormDescription>
                Unique identifier for this offer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="offer-basic.currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || 'EUR'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Currency for all prices in this offer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="offer-basic.date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Offer Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Date when this offer is issued
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="offer-basic.validUntil"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Valid Until</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      tomorrow.setHours(0, 0, 0, 0);
                      return date < tomorrow;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Expiration date for this offer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="offer-basic.paymentTerms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Payment Terms</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., Net 30 days, 2% discount if paid within 10 days"
                className="resize-none"
                {...field}
                value={field.value || ''} // Ensure controlled input
              />
            </FormControl>
            <FormDescription>
              Payment conditions and terms for this offer
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="offer-basic.deliveryTerms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Delivery Terms</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., FOB, EXW, DDP..."
                className="resize-none"
                {...field}
                value={field.value || ''} // Ensure controlled input
              />
            </FormControl>
            <FormDescription>
              Delivery conditions and incoterms
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="offer-basic.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information or special conditions..."
                className="resize-none"
                rows={4}
                {...field}
                value={field.value || ''} // Ensure controlled input
              />
            </FormControl>
            <FormDescription>
              Optional notes or special conditions for this offer
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </form>
  );
} 