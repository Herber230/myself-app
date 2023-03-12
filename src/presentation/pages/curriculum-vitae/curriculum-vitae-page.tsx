import { useTheme } from '@emotion/react';
import { useEffect } from 'react';

export function CurriculumVitaePage(): JSX.Element {
  const theme = useTheme();
  const color = theme.colors.white;

  useEffect(() => {
    document.body.style.backgroundColor = color;
  }, [color]);

  return (
    <div>
      <h1>Curriculum Vitae Page</h1>
    </div>
  );
}
