/// <reference types="jest" />
import clampResolve from '../clampResolve';

const MIN = 0;
const MAX = 100;
const clamp = clampResolve(MIN, MAX);

describe('clampResolve', () => {
  it('work for correct value', () => {
    const value = 50;

    expect(clamp(value)).toBe(value);
  });

  it('work value greater than max', () => {
    const value = MAX + 50;

    expect(clamp(value)).toBe(MAX);
  });

  it('work value less than min', () => {
    const value = MIN - 50;

    expect(clamp(value)).toBe(MIN);
  });
});
