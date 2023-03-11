import styled from '@emotion/styled';
import { NavigationBar } from '@presentation/components/organisms';
import { useScroll } from '@utils/hooks';
import { useElementSize } from 'usehooks-ts';

import { PlainSectionsProps } from './plain-sections.types';

const StyledNavBarContainer = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
`;

const StyledMainContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export function PlainSections({
  children,
  header,
  navigationBarLimit,
}: PlainSectionsProps): JSX.Element {
  const { scrollPosition } = useScroll();
  const [headerRef, { height: headerHeight }] = useElementSize();

  const showNavBar =
    scrollPosition > 1 && scrollPosition > (navigationBarLimit || headerHeight);

  return (
    <StyledMainContainer>
      <div ref={headerRef}>{header}</div>
      {showNavBar && (
        <StyledNavBarContainer>
          <NavigationBar />
        </StyledNavBarContainer>
      )}
      {children}
    </StyledMainContainer>
  );
}
