const parseItemDevice = (device) => {
  return {
    label: device.label,
    value: device.deviceId,
  };
};

export default parseItemDevice;
