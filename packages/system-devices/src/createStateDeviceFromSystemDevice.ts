export type TMediaDeviceInfoWithID = MediaDeviceInfo & { id: string };

const generateIdDeviceFromSystemDevice = (device: MediaDeviceInfo): string => {
  return `${device.deviceId}${device.label}${device.kind}`;
};

const createStateDeviceFromSystemDevice = (
  systemDevice: MediaDeviceInfo,
): TMediaDeviceInfoWithID => {
  const device = {
    ...systemDevice,
    id: generateIdDeviceFromSystemDevice(systemDevice),
  };

  return {
    ...device,

    toJSON() {
      return device;
    },
  };
};

export default createStateDeviceFromSystemDevice;
