import { hasCapability } from './utils';

import type { TKeyMediaTrackCapabilities } from './typings';

const hasAvailableVideoConstraints = (
  videoTrack: MediaStreamVideoTrack,
  supportedConstraints: TKeyMediaTrackCapabilities[],
): boolean => {
  const advancedCapabilities = videoTrack.getCapabilities();

  return supportedConstraints.some((constraintName: TKeyMediaTrackCapabilities) => {
    return hasCapability(advancedCapabilities, constraintName);
  });
};

export default hasAvailableVideoConstraints;
