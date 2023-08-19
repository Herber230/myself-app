import '@emotion/react';

import type { Theme as AppTheme } from './presentation/theming/types';

declare module '@emotion/react' {
  export interface Theme extends AppTheme {}
}
