// react
import { type RecipeDefinition } from '@chakra-ui/react';
import containerRecipe from './container';
import buttonRecipe from './button';

// -----------------------------------------------------------------------------

const recipes: Record<string, RecipeDefinition> = {
  container: containerRecipe,
  button: buttonRecipe,
};

export default recipes;
