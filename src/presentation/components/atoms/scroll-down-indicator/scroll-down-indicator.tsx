import styled from '@emotion/styled';

export const ScrollDownIndicator = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  content: '';

  ::before {
    animation: bounce 1s ease infinite;
    bottom: 3rem;
    color: ${({ theme }) => theme.palettes.secondary.main};
    content: '╲╱';
    font-size: 3rem;
    font-weight: 900;
    left: 50%;
    margin-left: -3rem;
    position: absolute;
  }

  @keyframes bounce {
    50% {
      transform: translateY(-50%);
    }
  }
`;
