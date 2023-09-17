import type { Theme } from '@presentation-theming/types';
import type { ReactNode } from 'react';

export interface ContentContainerProps {
  padding?: number;
  background?: keyof Theme['backgrounds'];
}

export interface NavigationWithBodyProps {
  children: ReactNode;
  contentContainer?: ContentContainerProps;
}
