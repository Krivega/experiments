/// <reference types="jest" />

import { renderHook } from '@testing-library/react';

import useCurrentWeekDay from '../useCurrentWeekDay';

describe('useCurrentWeekDay', () => {
  const realDate = Date;

  const mockDate = (isoDate: string) => {
    global.Date = class extends Date {
      public constructor() {
        super(isoDate);
      }
    } as DateConstructor;
  };

  beforeEach(() => {
    global.Date = realDate;
  });

  afterAll(() => {
    global.Date = realDate;
  });

  it('должен возвращать корректный день недели по текущей дате для понедельника', () => {
    mockDate('2024-01-01T00:00:00.000Z'); // Понедельник

    const { result } = renderHook(() => {
      return useCurrentWeekDay();
    });

    expect(result.current).toBe('monday');
  });

  it('должен возвращать корректный день недели по текущей дате для вторника', () => {
    mockDate('2024-01-02T00:00:00.000Z'); // Вторник

    const { result } = renderHook(() => {
      return useCurrentWeekDay();
    });

    expect(result.current).toBe('tuesday');
  });

  it('должен возвращать корректный день недели по текущей дате для четверга', () => {
    mockDate('2024-01-04T00:00:00.000Z'); // Четверг

    const { result } = renderHook(() => {
      return useCurrentWeekDay();
    });

    expect(result.current).toBe('thursday');
  });

  it('должен возвращать корректный день недели по текущей дате для пятницы', () => {
    mockDate('2024-01-05T00:00:00.000Z'); // Пятница

    const { result } = renderHook(() => {
      return useCurrentWeekDay();
    });

    expect(result.current).toBe('friday');
  });

  it('должен возвращать корректный день недели по текущей дате для субботы', () => {
    mockDate('2024-01-06T00:00:00.000Z'); // Суббота

    const { result } = renderHook(() => {
      return useCurrentWeekDay();
    });

    expect(result.current).toBe('saturday');
  });

  it('должен возвращать корректный день недели по текущей дате для воскресенья', () => {
    mockDate('2024-01-07T00:00:00.000Z'); // Воскресенье

    const { result } = renderHook(() => {
      return useCurrentWeekDay();
    });

    expect(result.current).toBe('sunday');
  });

  it('должен возвращать результат на момент первого рендера', () => {
    mockDate('2024-01-01T00:00:00.000Z'); // Понедельник

    const { result, rerender } = renderHook(() => {
      return useCurrentWeekDay();
    });

    expect(result.current).toBe('monday');

    mockDate('2024-01-02T00:00:00.000Z'); // Вторник

    rerender();

    expect(result.current).toBe('monday');
  });
});
