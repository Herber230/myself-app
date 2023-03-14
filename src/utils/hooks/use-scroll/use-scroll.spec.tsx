import { renderHook } from '../../../../test/test-utils';
import { useScroll } from './use-scroll';

describe('utils:hooks:use-scroll', () => {
  test('It should return the scroll position', () => {
    const { result } = renderHook(() => useScroll());
    expect(result.current).toStrictEqual({
      scrollPosition: 0,
      setScrollPosition: expect.any(Function),
    });
  });
});
