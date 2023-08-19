import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Chip } from '@presentation-core/atoms/chip';
import { Paragraph } from '@presentation-core/atoms/paragraph';
import type { PaletteOption } from '@presentation-theming/types';
import { AiFillCaretDown } from '@react-icons/all-files/ai/AiFillCaretDown';

import { SelectMultipleProps } from './select-multiple.types';

export const MainContainer = styled.div`
  display: flex;
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.grayScale[400]};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

// TODO: Solve theme font size
export const SearchInput = styled.input`
  border: ${({ theme }) => theme.border.line.md};
  font-size: 16px;
  margin: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(1)};
`;

//TODO: Solve fixed position and size for dropdown
export const DropDownContainer = styled.div`
  position: absolute;
  top: 32px;
`;

type DropDownOptionsProps<TOption> = Pick<
  SelectMultipleProps<TOption>,
  'options' | 'displayProperty' | 'keyProperty'
> & {
  onClick: (option: TOption) => void;
};
export function DropDownOptions<TOption>({
  options,
  keyProperty,
  displayProperty,
  onClick,
}: DropDownOptionsProps<TOption>): JSX.Element {
  const StyledDropDownOptions = styled.div`
    margin: 0;
    padding: 0;

    > ul {
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        margin: 0;
        padding: ${({ theme }) => theme.spacing(0, 1)};
        white-space: nowrap;
        :hover {
          color: ${({ theme }) => theme.palettes.primary.contrastText};
          background-color: ${({ theme }) => theme.palettes.primary.light};
        }
      }
    }
  `;

  return (
    <StyledDropDownOptions>
      <ul>
        {options.map(item => (
          <li
            key={String(`select-multiple-op-${item[keyProperty]}`)}
            onClick={() => onClick(item)}
          >
            <Paragraph>{String(item[displayProperty])}</Paragraph>
          </li>
        ))}
      </ul>
    </StyledDropDownOptions>
  );
}

type DropDownButtonProps = {
  radius: string;
  palette: PaletteOption;
  onClick: () => void;
};
export function DropDownButton({
  radius,
  palette,
  onClick,
}: DropDownButtonProps): JSX.Element {
  const theme = useTheme();

  const StyledContainer = styled.div`
    border: none;
    margin: 0 0 0 auto;
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
    <StyledContainer>
      <button onClick={onClick}>
        <AiFillCaretDown
          size={20}
          color={theme.palettes[palette].contrastText}
        />
      </button>
    </StyledContainer>
  );
}

type SelectionChipsProps<TOption> = Pick<
  SelectMultipleProps<TOption>,
  'selection' | 'displayProperty' | 'keyProperty'
> & {
  onRemove: (option: TOption) => void;
};
export function SelectionChips<TOption>({
  selection,
  keyProperty,
  displayProperty,
  onRemove,
}: SelectionChipsProps<TOption>): JSX.Element {
  const StyledChips = styled.div`
    display: flex;
    > div {
      margin: ${({ theme }) => theme.spacing(1)};
    }
  `;

  return (
    <StyledChips>
      {selection.map(item => (
        <Chip
          key={`select-multiple-${String(item[keyProperty])}`}
          onRemove={() => onRemove(item)}
        >
          <Paragraph>{String(item[displayProperty])}</Paragraph>
        </Chip>
      ))}
    </StyledChips>
  );
}
