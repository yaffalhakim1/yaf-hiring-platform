// chakra
import { defineTokens } from '@chakra-ui/react';

// -----------------------------------------------------------------------------

// similar to 'foundations' in Chakra v2
const tokens = defineTokens({
  colors: {
    // Set primary as the base color

    white: { value: '#ffffff' },
    primary: {
      50: { value: '#eff6ff' },
      100: { value: '#dbeafe' },
      200: { value: '#bfdbfe' },
      300: { value: '#93c5fd' },
      400: { value: '#60a5fa' },
      500: { value: '#01959F' },
      600: { value: '#2563eb' },
      700: { value: '#1d4ed8' },
      800: { value: '#1e40af' },
      900: { value: '#1e3a8a' },
      950: { value: '#172554' },
    },
    // Add base colors that Chakra UI expects
    gray: {
      50: { value: '#f9fafb' },
      100: { value: '#f3f4f6' },
      200: { value: '#e5e7eb' },
      300: { value: '#d1d5db' },
      400: { value: '#9ca3af' },
      500: { value: '#6b7280' },
      600: { value: '#4b5563' },
      700: { value: '#374151' },
      800: { value: '#1f2937' },
      900: { value: '#111827' },
      950: { value: '#030712' },
    },
    red: {
      50: { value: '#fef2f2' },
      100: { value: '#fee2e2' },
      200: { value: '#fecaca' },
      300: { value: '#fca5a5' },
      400: { value: '#f87171' },
      500: { value: '#ef4444' },
      600: { value: '#dc2626' },
      700: { value: '#b91c1c' },
      800: { value: '#991b1b' },
      900: { value: '#7f1d1d' },
      950: { value: '#450a0a' },
    },
    yellow: {
      50: { value: '#fffbeb' },
      100: { value: '#fef3c7' },
      200: { value: '#fde68a' },
      300: { value: '#fcd34d' },
      400: { value: '#fbbf24' },
      500: { value: '#f59e0b' },
      600: { value: '#d97706' },
      700: { value: '#b45309' },
      800: { value: '#92400e' },
      900: { value: '#78350f' },
      950: { value: '#451a03' },
    },
    green: {
      50: { value: '#f0fdf4' },
      100: { value: '#dcfce7' },
      200: { value: '#bbf7d0' },
      300: { value: '#86efac' },
      400: { value: '#4ade80' },
      500: { value: '#22c55e' },
      600: { value: '#16a34a' },
      700: { value: '#15803d' },
      800: { value: '#166534' },
      900: { value: '#14532d' },
      950: { value: '#052e16' },
    },
  },
});

export default tokens;
