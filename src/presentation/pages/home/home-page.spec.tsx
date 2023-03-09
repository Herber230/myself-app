import { render } from '@testing-library/react';

import { HomePage } from './home-page';

describe('pages:home', () => {
  test('It should render', () => {
    const { getByText } = render(<HomePage />);
    expect(getByText('Herber Colop')).toBeInTheDocument();
  });
});
