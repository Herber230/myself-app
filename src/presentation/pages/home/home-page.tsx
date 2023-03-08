import styled from '@emotion/styled';
import { darkTheme, lightTheme, useThemeContext } from '@presentation/theming';

const StyledDiv = styled.div`
  border: 1px solid red;
  background-color: ${({ theme }) => theme?.palettes?.primary?.main};
`;

export function HomePage(): JSX.Element {
  const { setTheme } = useThemeContext();

  return (
    <div>
      <br />
      <br />
      <button onClick={() => setTheme(lightTheme)}>Light Theme</button>
      <br />
      <button onClick={() => setTheme(darkTheme)}>Dark Theme</button>
      <br />
      <br />
      <StyledDiv>Home Page!!!</StyledDiv>
    </div>
  );
}
