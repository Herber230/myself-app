import { render } from '../../../../../test/test-utils';
import { HeadingFive } from './heading-five';

describe('presentation:components:atoms:heading-five', () => {
  test('It should render a heading', () => {
    const { getByText } = render(<HeadingFive>HeadingText</HeadingFive>);
    expect(getByText('HeadingText')).toBeInTheDocument();
  });
});
