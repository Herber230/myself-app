import { useTheme } from '@emotion/react';
import { useBodyBackgroundColor } from '@utils/hooks/use-body-background-color';

export function AboutRepoPage(): JSX.Element {
  const theme = useTheme();
  useBodyBackgroundColor(theme.colors.white);

  return (
    <div>
      <h1>About Repo</h1>
    </div>
  );
}
