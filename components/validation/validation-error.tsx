'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ValidationErrorProps {
  error?: string;
  className?: string;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ 
  error, 
  className 
}) => {
  if (!error) return null;

  return (
    <p className={cn(
      "text-sm font-medium text-destructive mt-1",
      className
    )}>
      {error}
    </p>
  );
}; 