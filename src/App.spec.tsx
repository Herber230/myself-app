import { render } from '@testing-library/react';

import App from './App';

describe('App', () => {
  test('It should render the component without throwing any error', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
