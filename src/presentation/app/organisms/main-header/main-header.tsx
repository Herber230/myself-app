import styled from '@emotion/styled';
import {
  HeadingOne,
  HeadingTwo,
  ScrollDownIndicator,
} from '@presentation-core/atoms';
import { useScroll } from '@utils/hooks';
import { useEffect, useState } from 'react';

const StyledMainContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.palettes.primary.main};
  color: ${({ theme }) => theme.palettes.primary.contrastText};
  overflow: hidden;
`;

const StyledFrame = styled.div`
  width: 80%;
  height: 80%;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);

  :before,
  :after {
    content: '';
    position: absolute;
    inset: -30px;
    border: 10px solid ${({ theme }) => theme.palettes.primary.contrastText};
    border-image: linear-gradient(
        -45deg,
        ${({ theme }) => theme.palettes.primary.contrastText} 20%,
        #0000 0 80%,
        ${({ theme }) => theme.palettes.primary.contrastText} 0
      )
      20;
  }
`;

const StyledTitleContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 10%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);

  > h1 {
    margin-bottom: 1rem;
  }
`;

const scrollIndicatorPositionLimit = 300;
const scrollIndicatorThreshold = 3000;

export function MainHeader(): JSX.Element {
  const { scrollPosition } = useScroll();
  const [timeoutCompleted, setTimeoutCompleted] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
    if (scrollPosition < scrollIndicatorPositionLimit)
      timeout = setTimeout(
        () => setTimeoutCompleted(true),
        scrollIndicatorThreshold,
      );
    else setTimeoutCompleted(false);

    return () => timeout && clearTimeout(timeout);
  }, [scrollPosition]);

  return (
    <StyledMainContainer>
      <StyledFrame>
        <StyledTitleContainer>
          <HeadingOne>Herber Colop</HeadingOne>
          <HeadingTwo>Software Engineer</HeadingTwo>
        </StyledTitleContainer>
      </StyledFrame>
      {scrollPosition < scrollIndicatorPositionLimit && timeoutCompleted && (
        <ScrollDownIndicator data-testid="scroll-down-indicator" />
      )}
    </StyledMainContainer>
  );
}
