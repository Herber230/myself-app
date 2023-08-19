import { render } from '../../../../../test/test-utils';
import { HeadingThree } from './heading-three';

describe('presentation:components:atoms:heading-three', () => {
  test('It should render a heading', () => {
    const { getByText } = render(<HeadingThree>HeadingText</HeadingThree>);
    expect(getByText('HeadingText')).toBeInTheDocument();
  });
});
