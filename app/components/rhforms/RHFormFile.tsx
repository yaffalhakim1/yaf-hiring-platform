import React from 'react';
import { useController, type Control } from 'react-hook-form';
import { Field, Input } from '@chakra-ui/react';

interface RHFormFileProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  accept?: string;
}

export default function RHFormFile({
  name,
  control,
  label,
  placeholder,
  disabled = false,
  required = false,
  accept,
}: RHFormFileProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    field.onChange(file);
  };

  return (
    <Field.Root invalid={!!error}>
      <Field.Label>
        {label}
        {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
      </Field.Label>
      <Input
        type='file'
        placeholder={placeholder}
        onChange={handleFileChange}
        disabled={disabled}
        accept={accept}
      />
      {error && <Field.ErrorText>{error.message}</Field.ErrorText>}
    </Field.Root>
  );
}
