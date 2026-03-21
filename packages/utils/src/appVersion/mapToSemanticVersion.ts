import transformAppVersionToNumericValue from './transformAppVersionToNumericValue';

import type { TSemanticVersion } from './types';

const mapToSemanticVersion = (version: string): TSemanticVersion | undefined => {
  const semanticVersionArray = transformAppVersionToNumericValue(version);

  if (semanticVersionArray.length === 0) {
    return undefined;
  }

  const [major, minor, revision] = semanticVersionArray;

  return {
    major,
    minor,
    revision,
  };
};

export default mapToSemanticVersion;
