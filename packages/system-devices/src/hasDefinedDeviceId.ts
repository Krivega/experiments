export const hasDefinedDeviceId = (deviceId: string | undefined): deviceId is string => {
  return deviceId !== undefined && deviceId !== '';
};
