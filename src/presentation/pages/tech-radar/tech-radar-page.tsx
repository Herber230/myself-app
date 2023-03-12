import { useTheme } from '@emotion/react';
import { useBodyBackgroundColor } from '@utils/hooks';

export function TechRadarPage(): JSX.Element {
  const theme = useTheme();
  useBodyBackgroundColor(theme.colors.white);

  return (
    <div>
      <h1>Tech Radar Page</h1>
    </div>
  );
}
