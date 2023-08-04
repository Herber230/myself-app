import styled from '@emotion/styled';
import { useEffect, useRef } from 'react';

import { DropDownPanelProps } from './drop-down-panel.types';

const StyledMainContainer = styled.div`
  position: absolute;
  display: inline-block;

  > div {
    position: absolute;
    z-index: 1;
    background-color: ${({ theme }) => theme.colors.grayScale[100]};
    border: ${({ theme }) => theme.border.line.md};
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

//TODO: Implement theme parameters
export function DropDownPanel({
  open,
  onClose,
  children,
}: DropDownPanelProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onClose]);

  return open ? (
    <StyledMainContainer ref={ref}>
      <div>{children}</div>
    </StyledMainContainer>
  ) : (
    <></>
  );
}
