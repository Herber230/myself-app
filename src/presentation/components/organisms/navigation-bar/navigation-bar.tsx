import styled from '@emotion/styled';
import { HeadingFive } from '@presentation/components/atoms';

const StyledNavigationBar = styled.nav`
  width: 100%;
  height: 50px;
  background-color: ${({ theme }) => theme.palettes.primary.main};
  color: ${({ theme }) => theme.palettes.primary.contrastText};
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4, 0)};
`;
export function NavigationBar(): JSX.Element {
  return (
    <StyledNavigationBar>
      {['Home', 'About', 'Projects', 'Contact'].map((t, i) => (
        <HeadingFive key={`nav-item-${i}`}>{t}</HeadingFive>
      ))}
    </StyledNavigationBar>
  );
}
