/// <reference types="jest" />
import hasHigherSemanticVersion from '../hasHigherSemanticVersion';

describe('map to semantic version', () => {
  it('should transform app version to numeric value', () => {
    expect(
      hasHigherSemanticVersion(
        { major: 3, minor: 9, revision: 0 },
        { major: 3, minor: 8, revision: 0 },
      ),
    ).toBe(true);
    expect(
      hasHigherSemanticVersion(
        { major: 31, minor: 0, revision: 0 },
        { major: 3, minor: 10, revision: 0 },
      ),
    ).toBe(true);
    expect(
      hasHigherSemanticVersion(
        { major: 3, minor: 0, revision: 1 },
        { major: 3, minor: 0, revision: 0 },
      ),
    ).toBe(true);
    expect(
      hasHigherSemanticVersion(
        { major: 3, minor: 0, revision: 0 },
        { major: 3, minor: 0, revision: 0 },
      ),
    ).toBe(false);
    expect(
      hasHigherSemanticVersion(
        { major: 3, minor: 7, revision: 0 },
        { major: 3, minor: 8, revision: 0 },
      ),
    ).toBe(false);
  });
});
