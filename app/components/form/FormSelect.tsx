import React from 'react';
import { Field, Select, createListCollection } from '@chakra-ui/react';

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export default function FormSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
  error,
}: FormSelectProps) {
  // Create collection from options
  const collection = createListCollection({
    items: options,
  });

  return (
    <Field.Root invalid={!!error}>
      {label && (
        <Field.Label>
          {label}
          {required && (
            <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
          )}
        </Field.Label>
      )}
      <Select.Root
        collection={collection}
        value={value ? [value] : []}
        onValueChange={(details) => onChange?.(details.value[0] || '')}
        disabled={disabled}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText placeholder={placeholder} />
          </Select.Trigger>
          <Select.IndicatorGroup>
            <Select.Indicator />
          </Select.IndicatorGroup>
        </Select.Control>
        <Select.Positioner>
          <Select.Content>
            {options.map((option) => (
              <Select.Item item={option} key={option.value}>
                {option.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Select.Root>
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
}
