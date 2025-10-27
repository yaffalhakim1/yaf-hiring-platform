/**
 * Form Component Types
 * Types for form components and form-related interfaces
 */

export interface FormOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FormFieldBase {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export interface FormInputProps extends FormFieldBase {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface FormTextareaProps extends FormFieldBase {
  rows?: number;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface FormSelectProps extends FormFieldBase {
  options: FormOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export interface FormFileProps extends FormFieldBase {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  value?: File[];
}
