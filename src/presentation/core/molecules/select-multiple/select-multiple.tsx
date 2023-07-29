import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Chip } from '@presentation-core/atoms/chip';
import { Paragraph } from '@presentation-core/atoms/paragraph';
import { AiFillCaretDown } from '@react-icons/all-files/ai/AiFillCaretDown';

import { SelectMultipleProps } from './select-multiple.types';

export function SelectMultiple<TOption>({
  keyProperty,
  displayProperty,
  options,
  selection,
  onChange,
  palette = 'primary',
}: SelectMultipleProps<TOption>): JSX.Element {
  const handleRemove = () => {};

  const theme = useTheme();

  const radius = theme.border.radius.md;
  const StyledMainContainer = styled.div`
    display: flex;
    border: 1px solid ${theme.colors.grayScale[400]};
    border-radius: ${radius};
  `;

  const StyledChips = styled.div`
    display: flex;
    > div {
      margin: ${theme.spacing(1)};
    }
  `;

  const StyledRight = styled.div`
    border: none;
    margin: 0;
    width: 30px;
    background-color: ${theme.palettes[palette].main};
    border-radius: 0 ${radius} ${radius} 0;
    button {
      border: none;
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      background-color: transparent;
    }
    &:hover {
      background-color: ${theme.palettes[palette].light};
    }
  `;

  return (
    <StyledMainContainer>
      <StyledChips>
        {selection.map((item) => (
          <Chip
            key={`select-multiple-${String(item[keyProperty])}`}
            onRemove={handleRemove}
          >
            <Paragraph>{String(item[displayProperty])}</Paragraph>
          </Chip>
        ))}
      </StyledChips>
      <StyledRight>
        <button>
          <AiFillCaretDown
            size={20}
            color={theme.palettes.primary.contrastText}
          />
        </button>
      </StyledRight>
    </StyledMainContainer>
  );
}
