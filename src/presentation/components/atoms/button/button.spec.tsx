import { render } from '../../../../../test/test-utils';
import { Button } from './button';

describe('presentation:components:atoms:button', () => {
  test('It should render a button', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeInTheDocument();
  });

  test('It should render a button and call onClick', () => {
    const onClick = jest.fn();
    const { getByText } = render(<Button onClick={onClick}>Click me</Button>);
    const button = getByText('Click me');
    button.click();
    expect(onClick).toHaveBeenCalled();
  });
});
