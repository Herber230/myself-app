import { HTMLProps, ReactNode } from 'react';

type BaseProps = Omit<HTMLProps<HTMLParagraphElement>, 'as' | 'size'>;

export const ParagraphSizes = {
  small: '1rem',
  normal: '1.2rem',
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
}
