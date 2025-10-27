import React from 'react';
import { useController, type Control } from 'react-hook-form';
import { z } from 'zod';
import FormTextarea from '../form/FormTextarea';

interface RHFormTextareaProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
}

export default function RHFormTextarea({
  name,
  control,
  label,
  placeholder,
  rows = 4,
  disabled = false,
  required = false,
}: RHFormTextareaProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <FormTextarea
      label={label}
      placeholder={placeholder}
      value={field.value || ''}
      onChange={field.onChange}
      rows={rows}
      disabled={disabled}
      required={required}
      error={error?.message}
    />
  );
}
