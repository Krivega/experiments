import createStateDeviceFromSystemDevice from '../createStateDeviceFromSystemDevice';

import type { TMediaDeviceInfoWithID } from '../createStateDeviceFromSystemDevice';

export type TMediaDeviceInfoWithIdAndResolutions<T> = TMediaDeviceInfoWithID & {
  resolutions: T[];
};

const getVideoDeviceMock = <T>(
  deviceGetter: () => TMediaDeviceInfoWithIdAndResolutions<T>,
): TMediaDeviceInfoWithIdAndResolutions<T> => {
  const { resolutions, ...restFields } = deviceGetter();

  const deviceWithId = createStateDeviceFromSystemDevice(restFields);

  const device = { messagesDescriptorForTranslate: undefined, ...deviceWithId, resolutions };

  return {
    ...device,
    toJSON() {
      return device;
    },
  };
};

export default getVideoDeviceMock;
