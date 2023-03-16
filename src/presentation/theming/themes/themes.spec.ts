import { baseTheme } from './base-theme';
import { darkTheme } from './dark-theme';
import { lightTheme } from './light-theme';
import { warmTheme } from './warm-theme';

describe('presentation:theming:themes', () => {
  test('It should check baseTheme snapshot', () => {
    expect(baseTheme).toMatchSnapshot();
  });

  test('It should check darkTheme snapshot', () => {
    expect(darkTheme).toMatchSnapshot();
  });

  test('It should check lightTheme snapshot', () => {
    expect(lightTheme).toMatchSnapshot();
  });

  test('It should check warmTheme snapshot', () => {
    expect(warmTheme).toMatchSnapshot();
  });
});
