import React from 'react';
import { useController, type Control } from 'react-hook-form';
import { z } from 'zod';
import FormInput from '../form/FormInput';

interface RHFormInputProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  disabled?: boolean;
  required?: boolean;
}

export default function RHFormInput({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
}: RHFormInputProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <FormInput
      label={label}
      placeholder={placeholder}
      value={field.value || ''}
      onChange={field.onChange}
      type={type}
      disabled={disabled}
      required={required}
      error={error?.message}
    />
  );
}
