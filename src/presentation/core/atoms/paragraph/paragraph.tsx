import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef } from 'react';

import type { ParagraphProps } from './paragraph.types';
import { ParagraphLineHeights, ParagraphSizes } from './paragraph.types';

export const Paragraph = forwardRef<HTMLParagraphElement, ParagraphProps>(
  (
    {
      children,
      size = 'normal',
      lineHeight = 'normal',
      textAlign = 'left',
      ...otherProps
    },
    ref,
  ) => {
    const theme = useTheme();

    const StyledParagraph = styled.p`
      font-family: ${theme.fonts.secondary.family};
      font-size: ${ParagraphSizes[size]};
      line-height: ${ParagraphLineHeights[lineHeight]};
      margin: 0;
      padding: 0;
      text-align: ${textAlign};
    `;

    return (
      <StyledParagraph ref={ref} {...otherProps}>
        {children}
      </StyledParagraph>
    );
  },
);
