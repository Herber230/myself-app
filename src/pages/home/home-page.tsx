import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AboutSection } from '@presentation-app/organisms/about-section';
import { MainHeader } from '@presentation-app/organisms/main-header';
import { PlainSections } from '@presentation-app/templates';
import { useBodyBackgroundColor } from '@utils/hooks/use-body-background-color';

const StyledSection = styled.section`
  min-height: 70vh;
  width: 100%;

  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export function HomePage(): JSX.Element {
  const theme = useTheme();
  useBodyBackgroundColor(theme.palettes.primary.main);

  return (
    <PlainSections header={<MainHeader />}>
      <StyledSection>
        <AboutSection />
      </StyledSection>
      <StyledSection>Tech radar</StyledSection>
      <StyledSection>Posts</StyledSection>
      <StyledSection>Career</StyledSection>
      <StyledSection>About this repo</StyledSection>
      <StyledSection>Contact</StyledSection>
    </PlainSections>
  );
}
