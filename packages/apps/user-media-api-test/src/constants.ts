export const STRING_OPTION_CONSTRAINT = 'stringOption';
export const POINTS_OF_INTEREST_CONSTRAINT = 'pointsOfInterest';
export const BOOLEAN_CONSTRAINT = 'boolean';
export const NUMBER_CONSTRAINT = 'number';

export enum EWhiteBalanceType {
  NONE = 'none',
  MANUAL = 'manual',
  SINGLE_SHOT = 'single-shot',
  CONTINUOUS = 'continuous',
}

export enum EExposureMode {
  NONE = 'none',
  MANUAL = 'manual',
  SINGLE_SHOT = 'single-shot',
  CONTINUOUS = 'continuous',
}

export enum EFacingMode {
  USER = 'user',
  ENVIRONMENT = 'environment',
  LEFT = 'left',
  RIGHT = 'right',
}

export enum EResizeMode {
  NONE = 'none',
  CROP_AND_SCALE = 'crop-and-scale',
}
