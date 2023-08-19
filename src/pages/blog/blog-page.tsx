import { useTheme } from '@emotion/react';
import { useBodyBackgroundColor } from '@utils/hooks/use-body-background-color';

export function BlogPage(): JSX.Element {
  const theme = useTheme();
  useBodyBackgroundColor(theme.colors.white);

  return <div>Blog Page!!!</div>;
}
