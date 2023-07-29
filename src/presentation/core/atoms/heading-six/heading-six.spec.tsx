import { render } from '../../../../../test/test-utils';
import { HeadingSix } from './heading-six';

describe('presentation:components:atoms:heading-six', () => {
  test('It should render a heading', () => {
    const { getByText } = render(<HeadingSix>HeadingText</HeadingSix>);
    expect(getByText('HeadingText')).toBeInTheDocument();
  });
});
