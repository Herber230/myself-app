import { render } from '../../../../test/test-utils';
import { CurriculumVitaePage } from './curriculum-vitae-page';

describe('presentation:pages:curriculum-vitae', () => {
  test('It should render the component without throwing any error', () => {
    expect(() => render(<CurriculumVitaePage />)).not.toThrow();
  });
});
