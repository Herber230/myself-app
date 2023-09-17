import type { HTMLProps, ReactNode } from 'react';

type BaseProps = Omit<HTMLProps<HTMLParagraphElement>, 'as' | 'size'>;

export const ParagraphSizes = {
  small: '0.9rem',
  normal: '1rem',
  large: '1.5rem',
} as const;

export type ParagraphSize = keyof typeof ParagraphSizes;

export const ParagraphLineHeights = {
  narrow: '1',
  normal: '1.5',
  broad: '2',
} as const;

export type ParagraphLineHeight = keyof typeof ParagraphLineHeights;

export interface ParagraphProps extends BaseProps {
  children: ReactNode;
  size?: ParagraphSize;
  lineHeight?: ParagraphLineHeight;
  textAlign?: 'left' | 'center' | 'right';
}
