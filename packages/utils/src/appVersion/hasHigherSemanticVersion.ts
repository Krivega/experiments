import type { TSemanticVersion } from './types';

const hasHigherSemanticVersion = (
  versionNew: TSemanticVersion,
  versionPrevious: TSemanticVersion,
) => {
  const { major: majorNew, minor: minorNew, revision: revisionNew } = versionNew;

  const { major: majorOld, minor: minorOld, revision: revisionOld } = versionPrevious;

  if (majorNew !== majorOld) {
    return majorNew > majorOld;
  }

  if (minorNew !== minorOld) {
    return minorNew > minorOld;
  }

  return revisionNew > revisionOld;
};

export default hasHigherSemanticVersion;
