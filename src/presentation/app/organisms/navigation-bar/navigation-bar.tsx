import styled from '@emotion/styled';
import { HeadingFive } from '@presentation-core/atoms';
import { Link } from 'react-router-dom';

//TODO: Use buttons insted of links and enable dropdowns
const StyledNavigationBar = styled.nav`
  width: 100%;
  height: 50px;
  background-color: ${({ theme }) => theme.palettes.primary.main};
  color: ${({ theme }) => theme.palettes.primary.contrastText};
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4, 0)};

  a {
    color: ${({ theme }) => theme.palettes.primary.contrastText} !important;
  }
`;

const routes = [
  {
    label: 'Home',
    path: '/',
  },
  {
    label: 'About this repo',
    path: '/about-repo',
  },
  {
    label: 'Blog',
    path: '/blog',
  },
  {
    label: 'Career',
    path: '/career',
  },
  {
    label: 'Curriculum Vitae',
    path: '/cv',
  },
  {
    label: 'Tech Radar',
    path: '/tech-radar',
  },
];

export function NavigationBar(): JSX.Element {
  return (
    <StyledNavigationBar>
      {routes.map(({ label, path }, index) => (
        <Link to={path} key={`nav-item-${index}`}>
          <HeadingFive>{label}</HeadingFive>
        </Link>
      ))}
    </StyledNavigationBar>
  );
}
