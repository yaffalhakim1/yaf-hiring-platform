import { RHFormInput, RHFormTextarea } from '../components/rhforms';
import RHFormPhotoCapture from '../components/rhforms/RHFormPhotoCapture';

export interface FieldConfig {
  component:
    | typeof RHFormInput
    | typeof RHFormTextarea
    | typeof RHFormPhotoCapture;
  props: Record<string, any>;
}

export interface FormFieldConfigs {
  fullName: FieldConfig;
  email: FieldConfig;
  phone: FieldConfig;
  linkedin: FieldConfig;
  domicile: FieldConfig;
  portfolio: FieldConfig;
  experience: FieldConfig;
  education: FieldConfig;
  photo: FieldConfig;
}

export type FieldConfigKey = keyof FormFieldConfigs;
