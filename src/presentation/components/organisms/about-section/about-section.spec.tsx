import { render } from '../../../../../test/test-utils';
import { AboutSection } from './about-section';

describe('presentation:components:organisms:about-section', () => {
  test('It should render the component without throwing any error', () => {
    expect(() => render(<AboutSection />)).not.toThrow();
  });
});
