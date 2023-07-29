import styled from '@emotion/styled';
import { SocialNetworks } from '@presentation-app/molecules/social-networks';
import { NavigationBar } from '@presentation-app/organisms/navigation-bar';

import { NavigationWithBodyProps } from './navigation-with-body.types';

const StyledMainContainer = styled.div`
  width: 100%;
  height: 100%;
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
`;

export function NavigationWithBody({
  children,
}: NavigationWithBodyProps): JSX.Element {
  return (
    <StyledMainContainer>
      <StyledNavBarContainer>
        <NavigationBar />
      </StyledNavBarContainer>
      <StyledSocialNetworksContainer>
        <SocialNetworks />
      </StyledSocialNetworksContainer>
      {children}
    </StyledMainContainer>
  );
}
