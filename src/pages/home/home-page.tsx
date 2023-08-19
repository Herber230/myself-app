import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AboutSection } from '@presentation-app/organisms/about-section';
import { MainHeader } from '@presentation-app/organisms/main-header';
import { PlainSections } from '@presentation-app/templates';
import { HeadingFour } from '@presentation-core/atoms/heading-four';
import { useBodyBackgroundColor } from '@utils/hooks/use-body-background-color';

const StyledSection = styled.section`
  position: relative;
  min-height: 70vh;
  width: 100%;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledImage = styled.img`
  width: 500px;
`;

export function HomePage(): JSX.Element {
  const theme = useTheme();
  useBodyBackgroundColor(theme.palettes.primary.main);

  return (
    <PlainSections header={<MainHeader />}>
      <StyledSection>
        <AboutSection />
      </StyledSection>
      <StyledSection>
        <HeadingFour>Tech Radar section</HeadingFour>
        <StyledImage
          src="/images/under-construction-simple.png"
          alt="Under construction"
        />
      </StyledSection>
      <StyledSection>
        <HeadingFour>Posts section</HeadingFour>
        <StyledImage
          src="/images/under-construction-simple.png"
          alt="Under construction"
        />
      </StyledSection>
      <StyledSection>
        <HeadingFour>Career section</HeadingFour>
        <StyledImage
          src="/images/under-construction-simple.png"
          alt="Under construction"
        />
      </StyledSection>
      <StyledSection>
        <HeadingFour>About This Repo section</HeadingFour>
        <StyledImage
          src="/images/under-construction-simple.png"
          alt="Under construction"
        />
      </StyledSection>
      <StyledSection>
        <HeadingFour>Contact section</HeadingFour>
        <StyledImage
          src="/images/under-construction-simple.png"
          alt="Under construction"
        />
      </StyledSection>
    </PlainSections>
  );
}
