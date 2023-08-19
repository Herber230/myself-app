import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { SocialNetworks } from '@presentation-app/molecules/social-networks';
import { NavigationBar } from '@presentation-app/organisms/navigation-bar';
import { useBodyBackgroundColor } from '@utils/hooks/use-body-background-color';

import type { NavigationWithBodyProps } from './navigation-with-body.types';

const StyledMainContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.white};
`;

const StyledNavBarContainer = styled.div`
  position: relative;
  display: block;
  width: 100%;
`;

const StyledSocialNetworksContainer = styled.div`
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  -transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  -webkit-transform: translateY(-50%);
  z-index: 1;
`;

const StyledContentContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

export function NavigationWithBody({
  children,
}: NavigationWithBodyProps): JSX.Element {
  const theme = useTheme();
  useBodyBackgroundColor(theme.palettes.primary.main);

  return (
    <StyledMainContainer>
      <StyledNavBarContainer>
        <NavigationBar />
      </StyledNavBarContainer>
      <StyledSocialNetworksContainer>
        <SocialNetworks />
      </StyledSocialNetworksContainer>
      <StyledContentContainer>{children}</StyledContentContainer>
    </StyledMainContainer>
  );
}
