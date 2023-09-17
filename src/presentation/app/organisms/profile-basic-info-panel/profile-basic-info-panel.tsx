import styled from '@emotion/styled';
import { HeadingFour } from '@presentation-core/atoms/heading-four';
import { HeadingThree } from '@presentation-core/atoms/heading-three';
import { Paragraph } from '@presentation-core/atoms/paragraph';
import { useObjectReducer } from '@utils/hooks/use-object-reducer';
import { useEffect } from 'react';

import type {
  ProfileBasicInfoPanelProps,
  ProfileBasicInfoPanelState,
} from './profile-basic-info-panel.types';

const initialState: ProfileBasicInfoPanelState = {
  isLoading: false,
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  bio: '',
  title: '',
  picture: {
    url: '',
    alt: '',
  },
};

const StyledContainer = styled.div`
  h3,
  h4 {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`;

export function ProfileBasicInfoPanel({
  uc,
}: ProfileBasicInfoPanelProps): JSX.Element {
  const [state, updateState] = useObjectReducer(initialState);

  useEffect(() => {
    updateState({ op: 'update', with: { isLoading: true } });
    uc().then(data => {
      updateState({
        op: 'update',
        with: {
          isLoading: false,
          ...data,
        },
      });
    });
  }, [uc, updateState]);

  return (
    <StyledContainer>
      <HeadingThree>{state.firstName + ' ' + state.lastName}</HeadingThree>
      <HeadingFour>{state.title}</HeadingFour>
      <Paragraph textAlign="center" size="small">
        {state.bio}
      </Paragraph>
    </StyledContainer>
  );
}
