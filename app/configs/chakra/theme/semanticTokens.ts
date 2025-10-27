// chakra
import { defineSemanticTokens } from '@chakra-ui/react';

// -----------------------------------------------------------------------------

const semanticTokens = defineSemanticTokens({
  colors: {
    // Set primary as the default color palette
    default: {
      solid: { value: '{colors.primary.500}' },
      contrast: { value: '{colors.primary.100}' },
      fg: {
        value: {
          _light: '{colors.primary.700}',
          _dark: '{colors.primary.600}',
        },
      },
      muted: { value: '{colors.primary.100}' },
      subtle: { value: '{colors.primary.200}' },
      emphasized: { value: '{colors.primary.300}' },
      focusRing: { value: '{colors.primary.200}' },
    },
    // Keep primary for explicit usage
    primary: {
      solid: { value: '{colors.primary.500}' },
      contrast: { value: '{colors.primary.100}' },
      fg: {
        value: {
          _light: '{colors.primary.700}',
          _dark: '{colors.primary.600}',
        },
      },
      muted: { value: '{colors.primary.100}' },
      subtle: { value: '{colors.primary.200}' },
      emphasized: { value: '{colors.primary.300}' },
      focusRing: { value: '{colors.primary.200}' },
    },
    // Keep other color palettes for flexibility
    secondary: {
      solid: { value: '{colors.gray.600}' },
      contrast: { value: '{colors.gray.100}' },
      fg: {
        value: {
          _light: '{colors.gray.700}',
          _dark: '{colors.gray.600}',
        },
      },
      muted: { value: '{colors.gray.100}' },
      subtle: { value: '{colors.gray.200}' },
      emphasized: { value: '{colors.gray.300}' },
      focusRing: { value: '{colors.gray.200}' },
    },
    success: {
      solid: { value: '{colors.green.500}' },
      contrast: { value: '{colors.green.100}' },
      fg: {
        value: {
          _light: '{colors.green.700}',
          _dark: '{colors.green.600}',
        },
      },
      muted: { value: '{colors.green.100}' },
      subtle: { value: '{colors.green.200}' },
      emphasized: { value: '{colors.green.300}' },
      focusRing: { value: '{colors.green.200}' },
    },
    warning: {
      solid: { value: '{colors.yellow.500}' },
      contrast: { value: '{colors.yellow.100}' },
      fg: {
        value: {
          _light: '{colors.yellow.700}',
          _dark: '{colors.yellow.600}',
        },
      },
      muted: { value: '{colors.yellow.100}' },
      subtle: { value: '{colors.yellow.200}' },
      emphasized: { value: '{colors.yellow.300}' },
      focusRing: { value: '{colors.yellow.200}' },
    },
    danger: {
      solid: { value: '{colors.red.500}' },
      contrast: { value: '{colors.red.100}' },
      fg: {
        value: {
          _light: '{colors.red.700}',
          _dark: '{colors.red.600}',
        },
      },
      muted: { value: '{colors.red.100}' },
      subtle: { value: '{colors.red.200}' },
      emphasized: { value: '{colors.red.300}' },
      focusRing: { value: '{colors.red.200}' },
    },
  },
});

export default semanticTokens;
