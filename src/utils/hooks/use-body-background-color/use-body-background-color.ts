import { useEffect } from 'react';

export function useBodyBackgroundColor(color: string) {
  useEffect(() => {
    document.body.style.backgroundColor = color;
  }, [color]);
}
