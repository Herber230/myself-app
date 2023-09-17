import { useObjectReducer } from '@utils/hooks/use-object-reducer';
import { useEffect } from 'react';

import type {
  ContactInfoPanelProps,
  ContactInfoPanelState,
} from './contact-info-panel.types';

const initialState: ContactInfoPanelState = {
  isLoading: false,
  id: undefined,
};

export function ContactInfoPanel({ uc }: ContactInfoPanelProps): JSX.Element {
  const [contactInfo, updateContactInfo] = useObjectReducer(initialState);

  useEffect(() => {
    updateContactInfo({ op: 'update', with: { isLoading: true } });
    uc().then(result => {
      updateContactInfo({
        op: 'update',
        with: {
          isLoading: false,
          ...result,
        },
      });
    });
  }, [uc, updateContactInfo]);

  return (
    <div>
      {!contactInfo.isLoading && (
        <>
          <div>{`email: ${contactInfo.email?.displayName}`}</div>
          <div>{`phone: ${contactInfo.facebook?.displayName}`}</div>
          <div>{`linkedin: ${contactInfo.linkedin?.displayName}`}</div>
          <div>{`github: ${contactInfo.github?.displayName}`}</div>
          <div>{`twitter: ${contactInfo.twitter?.displayName}`}</div>
          <div>{`goodreads : ${contactInfo.goodreads?.displayName}`}</div>
          <div>{`medium : ${contactInfo.medium?.displayName}`}</div>
          <div>{`stackoverflow: ${contactInfo.stackoverflow?.displayName}`}</div>
        </>
      )}
    </div>
  );
}
