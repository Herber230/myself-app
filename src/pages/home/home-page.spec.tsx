import { render } from '../../../test/test-utils';
import { HomePage } from './home-page';

describe('pages:home', () => {
  test('It should render', () => {
    const { getByText } = render(<HomePage />);
    expect(getByText('Herber Colop')).toBeInTheDocument();
  });
});
