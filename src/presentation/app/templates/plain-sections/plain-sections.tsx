import styled from '@emotion/styled';
import { SocialNetworks } from '@presentation-app/molecules/social-networks';
import { NavigationBar } from '@presentation-app/organisms/navigation-bar';
import { useScroll } from '@utils/hooks/use-scroll';
import { useElementSize } from 'usehooks-ts';

import type { PlainSectionsProps } from './plain-sections.types';

const StyledNavBarContainer = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1;
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

const StyledMainContainer = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.white};
`;

export function PlainSections({
  children,
  header,
  navigationBarLimit,
}: PlainSectionsProps): JSX.Element {
  const { scrollPosition } = useScroll();
  const [headerRef, { height: headerHeight }] = useElementSize();

  const showFixedElements =
    scrollPosition > 1 && scrollPosition > (navigationBarLimit || headerHeight);

  return (
    <StyledMainContainer>
      <div ref={headerRef}>{header}</div>
      {showFixedElements && (
        <>
          <StyledNavBarContainer>
            <NavigationBar />
          </StyledNavBarContainer>
          <StyledSocialNetworksContainer>
            <SocialNetworks />
          </StyledSocialNetworksContainer>
        </>
      )}
      {children}
    </StyledMainContainer>
  );
}
