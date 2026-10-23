import { act, renderHook } from '@testing-library/react-native';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('only updates after the value stops changing for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'T' },
    });

    rerender({ value: 'Ti' });
    act(() => jest.advanceTimersByTime(300));
    rerender({ value: 'Tim' }); // keystroke within the window restarts the timer
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('T');

    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('Tim');
  });
});
