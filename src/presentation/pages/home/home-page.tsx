import styled from '@emotion/styled';
import { AboutSection, MainHeader } from '@presentation/components/organisms';
import { PlainSections } from '@presentation/components/templates';

const StyledSection = styled.section`
  min-height: 70vh;
  width: 100%;

  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export function HomePage(): JSX.Element {
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
