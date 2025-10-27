import { defineRecipe } from '@chakra-ui/react';

// -----------------------------------------------------------------------------

const buttonRecipe = defineRecipe({
  base: {
    borderRadius: 'l2',
    fontWeight: 'bold',
    colorPalette: 'primary',
  },
  variants: {
    variant: {
      outline: {
        borderColor: 'colorPalette.solid',
      },
    },
  },
});

export default buttonRecipe;
