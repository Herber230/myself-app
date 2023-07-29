import { useTheme } from '@emotion/react';
import { useBodyBackgroundColor } from '@utils/hooks';

export function BlogPage(): JSX.Element {
  const theme = useTheme();
  useBodyBackgroundColor(theme.colors.white);

  return <div>Blog Page!!!</div>;
}
