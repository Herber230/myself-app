import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ImSpinner4 } from '@react-icons/all-files/im/ImSpinner4';

import type { LoadingProps } from './loading.types';

const PanelContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1;
  > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    -moz-transform: translate(-50%, -50%);
  }
`;

const AnimationContainer = styled.span`
  .spin-icon {
    animation: spin-animation 0.9s infinite;
  }
  @keyframes spin-animation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(359deg);
    }
  }
`;

const availableSizes = {
  sm: '20px',
  md: '40px',
  lg: '75px',
} as const;

export function Loading({
  size = 'md',
  palette = 'primary',
  fill = true,
}: LoadingProps): JSX.Element {
  const theme = useTheme();

  const spinner = (
    <AnimationContainer>
      <ImSpinner4
        className="spin-icon"
        size={availableSizes[size]}
        color={theme.palettes[palette].main}
      />
    </AnimationContainer>
  );

  return fill ? (
    <PanelContainer>
      <div>
        <div>{spinner}</div>
      </div>
    </PanelContainer>
  ) : (
    spinner
  );
}
