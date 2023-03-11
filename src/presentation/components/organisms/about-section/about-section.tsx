import styled from '@emotion/styled';
import { Paragraph } from '@presentation/components/atoms';
import { FaFileCode } from '@react-icons/all-files/fa/FaFileCode';

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10%;
  color: ${({ theme }) => theme.palettes.primary.main};
`;

export function AboutSection(): JSX.Element {
  return (
    <StyledMainContainer>
      <FaFileCode size={'75px'} />
      <Paragraph size="large" lineHeight="normal">
        Software passionate and persistent problem solver. Focused on resource
        development to improve team productivity.
        <br />
        Mainly experienced as a Typescript developer for NodeJS, ReactJS and
        Angular applications. Advocate for reactive technologies and
        microservices pattern.
      </Paragraph>
    </StyledMainContainer>
  );
}
