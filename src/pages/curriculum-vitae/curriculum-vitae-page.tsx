import styled from '@emotion/styled';
import { NavigationWithBody } from '@presentation-app/templates';
import { HeadingThree } from '@presentation-core/atoms/heading-three';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  > h3 {
    margin: 50px 0;
  }
  > img {
    width: 800px;
  }
`;

export function CurriculumVitaePage(): JSX.Element {
  return (
    <NavigationWithBody>
      <StyledContent>
        <HeadingThree>Curriculum Vitae</HeadingThree>
        <img
          src="/images/under-construction-windows.jpg"
          alt="Under construction"
        />
      </StyledContent>
    </NavigationWithBody>
  );
}
