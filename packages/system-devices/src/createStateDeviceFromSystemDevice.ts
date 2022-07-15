const generateIdDeviceFromSystemDevice = (device) => {
  return `${device.deviceId}${device.label}${device.kind}`;
};

const createStateDeviceFromSystemDevice = (systemDevice) => {
  return {
    ...systemDevice,
    id: generateIdDeviceFromSystemDevice(systemDevice),
  };
};

export default createStateDeviceFromSystemDevice;
