/// <reference types="jest" />
import mapToSemanticVersion from '../mapToSemanticVersion';

describe('map to semantic version', () => {
  it('should transform app version to numeric value', () => {
    expect(mapToSemanticVersion('3.9.0')).toEqual({ major: 3, minor: 9, revision: 0 });
    expect(mapToSemanticVersion('3.8.0')).toEqual({ major: 3, minor: 8, revision: 0 });
    expect(mapToSemanticVersion('3.7.0')).toEqual({ major: 3, minor: 7, revision: 0 });
  });
});
