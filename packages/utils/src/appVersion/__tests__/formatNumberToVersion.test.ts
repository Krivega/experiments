/// <reference types="jest" />
import formatNumberToVersion from '../formatNumberToVersion';

describe('format number to version', () => {
  it('should format number to version', () => {
    expect(formatNumberToVersion({ major: 1, minor: 1, revision: 1 })).toBe('1.1.1');
    expect(formatNumberToVersion({ major: 1, minor: 2, revision: 0 })).toBe('1.2.0');
    expect(formatNumberToVersion({ major: 1, minor: 2, revision: 34 })).toBe('1.2.34');
  });
});
