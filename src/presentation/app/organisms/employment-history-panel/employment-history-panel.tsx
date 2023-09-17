import { useObjectReducer } from '@utils/hooks/use-object-reducer';
import { useEffect } from 'react';

import type {
  EmploymentHistoryPanelProps,
  EmploymentHistoryPanelState,
} from './employment-history-panel.types';

const initialState: EmploymentHistoryPanelState = {
  data: [],
  isLoading: false,
};

export function EmploymentHistoryPanel({
  uc,
}: EmploymentHistoryPanelProps): JSX.Element {
  const [state, setState] = useObjectReducer(initialState);

  useEffect(() => {
    setState({
      op: 'update',
      with: {
        isLoading: true,
      },
    });
    uc().then(result => {
      setState({
        op: 'update',
        with: {
          isLoading: false,
          data: result,
        },
      });
    });
  }, [setState, uc]);

  return (
    <div>
      {!state.isLoading &&
        state.data.map(item => (
          <div
            key={`ehp-item-${item.id}`}
          >{`${item.employer.name} - ${item.role}`}</div>
        ))}
    </div>
  );
}
