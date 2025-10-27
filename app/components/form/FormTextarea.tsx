import React from 'react';
import { Field, Textarea } from '@chakra-ui/react';

interface FormTextareaProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export default function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  disabled = false,
  required = false,
  error,
}: FormTextareaProps) {
  return (
    <Field.Root invalid={!!error}>
      <Field.Label>
        {label}
        {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
      </Field.Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
      />
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
}
