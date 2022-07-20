import {
  STRING_OPTION_CONSTRAINT,
  POINTS_OF_INTEREST_CONSTRAINT,
  BOOLEAN_CONSTRAINT,
  NUMBER_CONSTRAINT,
  EWhiteBalanceType,
  EExposureMode,
  EFacingMode,
  EResizeMode,
} from './constants';

export const videoConstraints = {
  whiteBalanceMode: {
    type: STRING_OPTION_CONSTRAINT,
    default: EWhiteBalanceType.NONE,
    values: [
      EWhiteBalanceType.NONE,
      EWhiteBalanceType.MANUAL,
      EWhiteBalanceType.SINGLE_SHOT,
      EWhiteBalanceType.CONTINUOUS,
    ],
  },
  exposureMode: {
    type: STRING_OPTION_CONSTRAINT,
    default: EExposureMode.NONE,
    values: [
      EExposureMode.NONE,
      EExposureMode.MANUAL,
      EExposureMode.SINGLE_SHOT,
      EExposureMode.CONTINUOUS,
    ],
  },
  facingMode: {
    type: STRING_OPTION_CONSTRAINT,
    default: EFacingMode.USER,
    values: [EFacingMode.USER, EFacingMode.ENVIRONMENT, EFacingMode.LEFT, EFacingMode.RIGHT],
  },
  resizeMode: {
    type: STRING_OPTION_CONSTRAINT,
    default: EResizeMode.NONE,
    values: [EResizeMode.NONE, EResizeMode.CROP_AND_SCALE],
  },
  torch: { type: BOOLEAN_CONSTRAINT, default: false, defaultObj: { exact: false, ideal: false } },
  pointsOfInterest: { type: POINTS_OF_INTEREST_CONSTRAINT, default: { x: 10, y: 10 } },
  height: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  width: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  aspectRatio: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  frameRate: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  exposureCompensation: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  colorTemperature: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  iso: { type: NUMBER_CONSTRAINT, default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  contrast: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  brightness: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  saturation: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  sharpness: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  focusDistance: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  zoom: { type: NUMBER_CONSTRAINT, default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  pan: { type: NUMBER_CONSTRAINT, default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
  tilt: { type: NUMBER_CONSTRAINT, default: 0, defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 } },
};

export const audioConstraints = {
  autoGainControl: {
    type: BOOLEAN_CONSTRAINT,
    default: false,
    defaultObj: { exact: false, ideal: false },
  },
  echoCancellation: {
    type: BOOLEAN_CONSTRAINT,
    default: false,
    defaultObj: { exact: false, ideal: false },
  },
  noiseSuppression: {
    type: BOOLEAN_CONSTRAINT,
    default: false,
    defaultObj: { exact: false, ideal: false },
  },
  channelCount: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  latency: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  volume: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  sampleRate: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
  sampleSize: {
    type: NUMBER_CONSTRAINT,
    default: 0,
    defaultObj: { min: 0, max: 0, exact: 0, ideal: 0 },
  },
};
