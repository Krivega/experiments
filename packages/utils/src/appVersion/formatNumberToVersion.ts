import type { TSemanticVersion } from './types';

const formatNumberToVersion = (version: TSemanticVersion) => {
  return `${version.major}.${version.minor}.${version.revision}`;
};

export default formatNumberToVersion;
