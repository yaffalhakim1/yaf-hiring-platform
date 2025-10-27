import React from 'react';
import { useController, type Control } from 'react-hook-form';
import { z } from 'zod';
import FormSelect from '../form/FormSelect';

interface Option {
  label: string;
  value: string;
}

interface RHFormSelectProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  options: Option[];
  disabled?: boolean;
  required?: boolean;
}

export default function RHFormSelect({
  name,
  control,
  label,
  placeholder,
  options,
  disabled = false,
  required = false,
}: RHFormSelectProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <FormSelect
      label={label}
      placeholder={placeholder}
      options={options}
      value={field.value || ''}
      onChange={field.onChange}
      disabled={disabled}
      required={required}
      error={error?.message}
    />
  );
}
