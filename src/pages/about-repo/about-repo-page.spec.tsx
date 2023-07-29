import { render } from '../../../../test/test-utils';
import { AboutRepoPage } from './about-repo-page';

describe('presentation:pages:about-repo', () => {
  test('It should render the component without throwing any error', () => {
    expect(() => render(<AboutRepoPage />)).not.toThrow();
  });
});
