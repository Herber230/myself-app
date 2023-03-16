import { act, renderHook } from '../../../../test/test-utils';
import { useScroll } from './use-scroll';

describe('utils:hooks:use-scroll', () => {
  let scroll: () => void;

  beforeAll(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(window, 'addEventListener').mockImplementation((_, cb) => {
      scroll = cb;
    });
  });

  test('It should return the scroll position', async () => {
    const { result } = renderHook(() => useScroll());
    expect(result.current).toStrictEqual({
      scrollPosition: 0,
      setScrollPosition: expect.any(Function),
    });

    act(() => {
      window.pageYOffset = 100;
      scroll();
    });

    expect(result.current).toStrictEqual({
      scrollPosition: 100,
      setScrollPosition: expect.any(Function),
    });
  });
});
