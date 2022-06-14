const VIDEO_KIND = 'videoinput';
const AUDIO_INPUT_KIND = 'audioinput';
const AUDIO_OUTPUT_KIND = 'audiooutput';

/**
 * Filter return include prop:value devices
 * @param {string} prop prop
 * @returns {array} devices filtered
 */
const resolveFilterIncludingDevices = (prop) => (value) => (devices = []) =>
  devices.filter((device) => device[prop] === value);

/**
 * Filter return exclude prop:value devices
 * @param {string} prop prop
 * @returns {array} devices filtered
 */
export const resolveFilterExcludingDevices = (prop) => (value) => (devices = []) =>
  devices.filter((device) => device[prop] !== value);

export const getVideoDevices = resolveFilterIncludingDevices('kind')(VIDEO_KIND);
export const getAudioInputDevices = resolveFilterIncludingDevices('kind')(AUDIO_INPUT_KIND);
export const getAudioOutputDevices = resolveFilterIncludingDevices('kind')(AUDIO_OUTPUT_KIND);

/**
 * resolveFindDevice
 * @param {string} prop prop
 * @returns {object} device finded
 */
const resolveFindDevice = (prop) => (value) => (devices = []) =>
  devices.find((device) => device[prop] === value);

export const findDeviceById = resolveFindDevice('deviceId');
