import { useReducer } from 'react';

interface State<T> {
  status: 'pristine' | 'pending' | 'success' | 'error';
  result: T | null;
}

export function useBusinessCase(performer: () => Promise<void>) {
  WIP: Write this hook
}
