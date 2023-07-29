import { useReducer } from 'react';

type Action<T> =
  | {
      type: 'clear';
    }
  | {
      type: 'set';
      payload: T;
    }
  | {
      type: 'update';
      payload: Partial<T>;
    }
  | {
      type: 'setProp';
      payload: {
        prop: keyof T;
        value: T[keyof T];
      };
    };

function reducer<T>(state: T, action: Action<T>): T {
  switch (action.type) {
    case 'clear':
      return {} as T;
    case 'set':
      return action.payload;
    case 'update':
      return { ...state, ...action.payload };
    case 'setProp':
      return { ...state, [action.payload.prop]: action.payload.value };
    default:
      return state;
  }
}

export function useObjectReducer<T>(initialValue: T) {
  return useReducer(reducer, initialValue);
}
