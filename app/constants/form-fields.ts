import type { FormFieldConfigs } from '../types/form-fields';
import { RHFormInput, RHFormTextarea } from '../components/rhforms';
import RHFormPhotoCapture from '../components/rhforms/RHFormPhotoCapture';
import SimpleCameraCapture from '../components/rhforms/SimpleCameraCapture';
import TensorFlowGestureCapture from '../components/rhforms/TensorFlowGestureCapture';

export const FIELD_CONFIGS: FormFieldConfigs = {
  fullName: {
    component: RHFormInput,
    props: {
      placeholder: 'Masukkan nama lengkap Anda',
      type: 'text' as const,
    },
  },
  email: {
    component: RHFormInput,
    props: {
      placeholder: 'Masukkan email Anda',
      type: 'email' as const,
    },
  },
  phone: {
    component: RHFormInput,
    props: {
      placeholder: 'Masukkan nomor telepon Anda',
      type: 'text' as const,
    },
  },
  linkedin: {
    component: RHFormInput,
    props: {
      placeholder: 'https://linkedin.com/in/profilanda',
      type: 'text' as const,
    },
  },
  domicile: {
    component: RHFormInput,
    props: {
      placeholder: 'Masukkan kota domisili Anda',
      type: 'text' as const,
    },
  },
  portfolio: {
    component: RHFormInput,
    props: {
      placeholder: 'Masukkan link portfolio Anda',
      type: 'text' as const,
    },
  },
  experience: {
    component: RHFormTextarea,
    props: {
      placeholder: 'Jelaskan pengalaman kerja Anda...',
      rows: 3,
    },
  },
  education: {
    component: RHFormInput,
    props: {
      placeholder: 'Masukkan pendidikan terakhir Anda',
      type: 'text' as const,
    },
  },
  photo: {
    component: TensorFlowGestureCapture,
    props: {},
  },
};
