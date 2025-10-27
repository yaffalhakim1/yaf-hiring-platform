// chakra
import { type ThemingConfig } from '@chakra-ui/react';

// -----------------------------------------------------------------------------

import recipes from './recipes';
import tokens from './tokens';
import semanticTokens from './semanticTokens';

// -----------------------------------------------------------------------------

const theme: ThemingConfig = {
  recipes,
  tokens,
  semanticTokens,
};

export default theme;
