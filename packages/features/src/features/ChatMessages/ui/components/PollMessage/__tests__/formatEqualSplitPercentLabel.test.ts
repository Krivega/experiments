/// <reference types="jest" />
import formatEqualSplitPercentLabel from '../formatEqualSplitPercentLabel';

describe('formatEqualSplitPercentLabel', () => {
  it('при n = 3 возвращает 33.3%', () => {
    expect(formatEqualSplitPercentLabel(3)).toBe('33.3%');
  });

  it('при целой доле без десятых — без .0', () => {
    expect(formatEqualSplitPercentLabel(2)).toBe('50%');
    expect(formatEqualSplitPercentLabel(4)).toBe('25%');
    expect(formatEqualSplitPercentLabel(5)).toBe('20%');
    expect(formatEqualSplitPercentLabel(1)).toBe('100%');
  });

  it('при n = 6 — одна цифра после запятой', () => {
    expect(formatEqualSplitPercentLabel(6)).toBe('16.7%');
  });

  it('при optionCount <= 0 — 0%', () => {
    expect(formatEqualSplitPercentLabel(0)).toBe('0%');
  });
});
