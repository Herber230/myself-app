import styled from '@emotion/styled';
import { HeadingOne, HeadingTwo } from '@presentation/components/atoms';

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

export function MainHeader(): JSX.Element {
  return (
    <StyledMainContainer>
      <StyledFrame>
        <StyledTitleContainer>
          <HeadingOne>Herber Colop</HeadingOne>
          <HeadingTwo>Software Engineer</HeadingTwo>
        </StyledTitleContainer>
      </StyledFrame>
    </StyledMainContainer>
  );
}
