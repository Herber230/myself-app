import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AiOutlineCloseCircle } from '@react-icons/all-files/ai/AiOutlineCloseCircle';

import { ChipProps } from './chip.types';

export function Chip({
  children,
  palette = 'primary',
  onRemove,
}: ChipProps): JSX.Element {
  const theme = useTheme();

  const StyledChip = styled.div`
    border-radius: 25px;
    display: flex;
    border: none;
    background-color: ${theme.palettes[palette].main};
    color: ${theme.palettes[palette].contrastText};
  `;

  const StyledClose = styled.div`
    background-color: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;

    button {
      border: none;
      border-radius: 100%;
      background-color: transparent;
      color: ${theme.palettes[palette].contrastText};
      margin: 2px 7px 0 0;
      padding: 0;
      &:hover {
        background-color: ${theme.palettes[palette].light};
      }
    }
  `;

  const StyledInnerContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 7px;
  `;

  return (
    <StyledChip>
      <StyledInnerContainer>{children}</StyledInnerContainer>
      <StyledClose onClick={onRemove}>
        <button type="button">
          <AiOutlineCloseCircle size={20} />
        </button>
      </StyledClose>
    </StyledChip>
  );
}
