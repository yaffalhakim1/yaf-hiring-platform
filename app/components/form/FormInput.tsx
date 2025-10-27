import React from 'react';
import { Field, Input } from '@chakra-ui/react';

interface FormInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'number' | 'email' | 'password';
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export default function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  required = false,
  error,
}: FormInputProps) {
  return (
    <Field.Root invalid={!!error}>
      <Field.Label>
        {label}
        {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
      </Field.Label>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        type={type}
        disabled={disabled}
      />
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
}
