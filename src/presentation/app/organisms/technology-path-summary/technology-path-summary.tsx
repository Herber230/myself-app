import { useObjectReducer } from '@utils/hooks/use-object-reducer';
import { useEffect } from 'react';

import { initialState } from './lib';
import type { TechnologyPathSummaryProps } from './technology-path-summary.types';

export function TechnologyPathSummary({
  uc,
}: TechnologyPathSummaryProps): JSX.Element {
  const [state, updateState] = useObjectReducer(initialState);

  useEffect(() => {
    updateState({ op: 'update', with: { isLoading: true } });
    uc(state.summaryType).then(result => {
      updateState({
        op: 'update',
        with: {
          isLoading: false,
          rows: result,
        },
      });
    });
  }, [uc, updateState, state.summaryType]);

  return (
    <div>
      {state.rows.map((row, index) => (
        <div key={index}>
          {`Tech: ${
            row.technology.name
          } From: ${row.start.getFullYear()} To: ${row.end?.getFullYear()}`}
        </div>
      ))}
    </div>
  );
}
