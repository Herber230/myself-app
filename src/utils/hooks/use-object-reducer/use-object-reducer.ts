import type { Reducer } from 'react';
import { useReducer } from 'react';

import type { Action } from './use-object-reducer.types';

function reducer<T>(state: T, action: Action<T>): T {
  switch (action.op) {
    case 'clear':
      return {} as T;
    case 'set':
      return action.with;
    case 'update':
      return { ...state, ...action.with };
    case 'setProp':
      return { ...state, [action.with.prop]: action.with.value };
  }
}

export function useObjectReducer<T>(initialValue: T) {
  return useReducer<Reducer<T, Action<T>>>(reducer, initialValue);
}
