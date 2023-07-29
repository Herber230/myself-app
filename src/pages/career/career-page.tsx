import { useTheme } from '@emotion/react';
import { useBodyBackgroundColor } from '@utils/hooks';

export function CareerPage(): JSX.Element {
  const theme = useTheme();
  useBodyBackgroundColor(theme.colors.white);

  return (
    <div>
      <h1>Career Page</h1>
    </div>
  );
}
