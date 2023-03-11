import styled from '@emotion/styled';
import { Button } from '@presentation/components/atoms';
import { FaFacebook } from '@react-icons/all-files/fa/FaFacebook';
import { FaGithub } from '@react-icons/all-files/fa/FaGithub';
import { FaGoodreads } from '@react-icons/all-files/fa/FaGoodreads';
import { FaLinkedin } from '@react-icons/all-files/fa/FaLinkedin';
import { FaMedium } from '@react-icons/all-files/fa/FaMedium';
import { FaStackOverflow } from '@react-icons/all-files/fa/FaStackOverflow';
import { FaTwitter } from '@react-icons/all-files/fa/FaTwitter';

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const iconSize = 30;

export function SocialNetworks(): JSX.Element {
  return (
    <StyledMainContainer>
      <Button>
        <FaLinkedin size={iconSize} />
      </Button>
      <Button>
        <FaGithub size={iconSize} />
      </Button>
      <Button>
        <FaStackOverflow size={iconSize} />
      </Button>
      <Button>
        <FaMedium size={iconSize} />
      </Button>
      <Button>
        <FaGoodreads size={iconSize} />
      </Button>
      <Button>
        <FaTwitter size={iconSize} />
      </Button>
      <Button>
        <FaFacebook size={iconSize} />
      </Button>
    </StyledMainContainer>
  );
}
