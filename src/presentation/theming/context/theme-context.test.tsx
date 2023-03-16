import { renderHook } from '../../../../test/test-utils';
import { useThemeContext } from './theme-context';

describe('presentation:theming:context', () => {
  test('It should render the hook correctly', () => {
    const { result } = renderHook(() => useThemeContext());

    expect(result.current).toEqual({});
  });
});
