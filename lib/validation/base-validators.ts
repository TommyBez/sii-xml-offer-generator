import { z } from 'zod';

// Base validators for common patterns
export const baseValidators = {
  alphanumeric: (maxLength: number) =>
    z
      .string()
      .max(maxLength, `Maximum ${maxLength} characters allowed`)
      .regex(/^[A-Z0-9]+$/i, "Only alphanumeric characters allowed"),

  numeric: (digits: number, decimals?: number) => {
    if (decimals) {
      const maxValue = Math.pow(10, digits - decimals) - Math.pow(10, -decimals);
      return z
        .number()
        .multipleOf(Math.pow(10, -decimals), `Maximum ${decimals} decimal places allowed`)
        .max(maxValue, `Maximum value is ${maxValue}`);
    } else {
      const maxValue = Math.pow(10, digits) - 1;
      return z
        .number()
        .int("Must be an integer")
        .max(maxValue, `Maximum value is ${maxValue}`);
    }
  },

  timestamp: () =>
    z
      .string()
      .regex(
        /^\d{2}\/\d{2}\/\d{4}_\d{2}:\d{2}:\d{2}$/,
        "Format must be DD/MM/YYYY_HH:MM:SS"
      )
      .refine(
        (val) => {
          const [datePart, timePart] = val.split('_');
          const [day, month, year] = datePart.split('/').map(Number);
          const [hours, minutes, seconds] = timePart.split(':').map(Number);
          
          // Basic date validation
          if (month < 1 || month > 12) return false;
          if (day < 1 || day > 31) return false;
          if (hours < 0 || hours > 23) return false;
          if (minutes < 0 || minutes > 59) return false;
          if (seconds < 0 || seconds > 59) return false;
          
          return true;
        },
        "Invalid date or time values"
      ),

  monthYear: () => 
    z
      .string()
      .regex(/^\d{2}\/\d{4}$/, "Format must be MM/YYYY")
      .refine(
        (val) => {
          const [month] = val.split('/').map(Number);
          return month >= 1 && month <= 12;
        },
        "Invalid month value"
      ),

  vatNumber: () =>
    z
      .string()
      .length(16, "VAT number must be exactly 16 characters")
      .regex(/^[A-Z0-9]+$/i, "Only alphanumeric characters allowed"),

  url: () =>
    z
      .string()
      .url("Invalid URL format")
      .max(100, "Maximum 100 characters allowed"),

  phone: () =>
    z
      .string()
      .max(15, "Maximum 15 characters allowed")
      .regex(/^[\d\s\+\-\(\)]+$/, "Invalid phone format"),

  percentage: () =>
    z
      .number()
      .min(0, "Percentage must be at least 0")
      .max(100, "Percentage must be at most 100"),

  positiveInteger: () =>
    z
      .number()
      .int("Must be an integer")
      .positive("Must be a positive number"),

  nonNegativeNumber: () =>
    z
      .number()
      .nonnegative("Must be a non-negative number"),
};

// Helper function to parse Italian date format
export const parseItalianDate = (dateStr: string): Date => {
  const [datePart, timePart] = dateStr.split('_');
  const [day, month, year] = datePart.split('/').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  
  return new Date(
    year,
    month - 1, // Month is 0-indexed in JS
    day,
    hours,
    minutes,
    seconds
  );
};

// Helper function to format date to Italian format
export const formatItalianDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${day}/${month}/${year}_${hours}:${minutes}:${seconds}`;
}; 