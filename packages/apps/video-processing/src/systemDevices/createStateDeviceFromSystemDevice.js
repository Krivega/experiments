const generateIdDeviceFromSystemDevice = (device) =>
  `${device.deviceId}${device.label}${device.kind}`;

const createStateDeviceFromSystemDevice = (systemDevice) => ({
  ...systemDevice,
  id: generateIdDeviceFromSystemDevice(systemDevice),
});

export default createStateDeviceFromSystemDevice;
