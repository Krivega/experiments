export const videoConstraints = {
  torch: { type: 'boolean', default: false, defaultObj: { exact: false, ideal: false } },
  whiteBalanceMode: {
    type: 'stringOption',
    default: 'none',
    values: ['none', 'manual', 'single-shot', 'continuous'],
  },
  exposureMode: {
    type: 'stringOption',
    default: 'none',
    values: ['none', 'manual', 'single-shot', 'continuous'],
  },
  pointsOfInterest: { type: 'pointsOfInterest', default: { x: 0, y: 0 } },
  exposureCompensation: {
    type: 'number',
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  colorTemperature: {
    type: 'number',
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  iso: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  contrast: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  brightness: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  saturation: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  sharpness: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  focusDistance: {
    type: 'number',
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  zoom: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  pan: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  tilt: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  width: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  height: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  aspectRatio: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  frameRate: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  facingMode: { type: 'string', default: '', defaultObj: { exact: '', ideal: '' } },
  resizeMode: { type: 'stringOption', default: 'none', values: ['none', 'crop-and-scale'] },
};

export const audioConstraints = {
  autoGainControl: {
    type: 'boolean',
    default: false,
    defaultObj: { exact: false, ideal: false },
  },
  echoCancellation: {
    type: 'boolean',
    default: false,
    defaultObj: { exact: false, ideal: false },
  },
  noiseSuppression: {
    type: 'boolean',
    default: false,
    defaultObj: { exact: false, ideal: false },
  },
  channelCount: {
    type: 'number',
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  latency: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  volume: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  sampleRate: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  sampleSize: { type: 'number', default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
};
