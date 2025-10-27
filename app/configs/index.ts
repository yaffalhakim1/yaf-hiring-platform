// chakra
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import theme from './chakra/theme';

// -----------------------------------------------------------------------------

const CHAKRA_CONFIG = defineConfig({
  theme,
});

const CHAKRA_SYSTEM = createSystem(defaultConfig, CHAKRA_CONFIG);

export default CHAKRA_SYSTEM;
