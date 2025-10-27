import { defineRecipe } from '@chakra-ui/react';

// -----------------------------------------------------------------------------

const containerRecipe = defineRecipe({
  variants: {
    clearVertical: {
      true: {
        py: { base: 4, sm: 6, md: 8 },
      },
    },
    clearTop: {
      true: {
        pt: { base: 4, sm: 6, md: 8 },
      },
    },
    clearBottom: {
      true: {
        pb: { base: 4, sm: 6, md: 8 },
      },
    },
  },
});

export default containerRecipe;
