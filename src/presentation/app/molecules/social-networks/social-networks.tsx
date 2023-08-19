import styled from '@emotion/styled';
import { Button } from '@presentation-core/atoms/button';
import { FaFacebook } from '@react-icons/all-files/fa/FaFacebook';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { FaGoodreads } from '@react-icons/all-files/fa/FaGoodreads';
import { FaLinkedin } from '@react-icons/all-files/fa/FaLinkedin';
import { FaMedium } from '@react-icons/all-files/fa/FaMedium';
import { FaStackOverflow } from '@react-icons/all-files/fa/FaStackOverflow';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';

const iconSize = 30;
const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

export function SocialNetworks(): JSX.Element {
  return (
    <StyledMainContainer>
      <Button data-testid="linkedin-button">
        <FaLinkedin size={iconSize} />
      </Button>
      <Button data-testid="github-button">
        <FaGithub size={iconSize} />
      </Button>
      <Button data-testid="stackoverflow-button">
        <FaStackOverflow size={iconSize} />
      </Button>
      <Button data-testid="medium-button">
        <FaMedium size={iconSize} />
      </Button>
      <Button data-testid="goodreads-button">
        <FaGoodreads size={iconSize} />
      </Button>
      <Button data-testid="twitter-button">
        <FaTwitter size={iconSize} />
      </Button>
      <Button data-testid="facebook-button">
        <FaFacebook size={iconSize} />
      </Button>
    </StyledMainContainer>
  );
}
