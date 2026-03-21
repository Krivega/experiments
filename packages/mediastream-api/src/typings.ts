export type MediaTrackCapabilitiesExtended = MediaTrackCapabilities & {
  torch?: boolean;
  whiteBalanceMode?: string;
  zoom?: number;
};

export type TKeyMediaTrackSettings = keyof MediaTrackSettings;
export type TKeyMediaTrackCapabilities = keyof MediaTrackCapabilitiesExtended;
export type TKeyMediaTrackConstraints = keyof MediaTrackConstraints;
export type TValueMediaTrackConstraints = MediaTrackConstraints[TKeyMediaTrackConstraints];

export type TConstraintModeType = 'continuous' | 'manual';

export type TVideoTrackSettings = {
  sharpness?: number;
  saturation?: number;
  brightness?: number;
  contrast?: number;
  colorTemperature?: number;
  focusDistance?: number;
  zoom?: number;
  pan?: number;
  tilt?: number;
  focusMode?: TConstraintModeType;
  whiteBalanceMode?: TConstraintModeType;
};

export type TAvailableSetting = {
  value: number;
  mode?: Record<string, TConstraintModeType>;
};

export type TAvailableSettings = {
  sharpness?: TAvailableSetting;
  saturation?: TAvailableSetting;
  brightness?: TAvailableSetting;
  contrast?: TAvailableSetting;
  colorTemperature?: TAvailableSetting;
  focusDistance?: TAvailableSetting;
  zoom?: TAvailableSetting;
  pan?: TAvailableSetting;
  tilt?: TAvailableSetting;
};

export type TAdvancedCapability = {
  min: number;
  max: number;
  step: number;
};

export type TAdvancedCapabilities = {
  pan?: TAdvancedCapability;
  tilt?: TAdvancedCapability;
  zoom?: TAdvancedCapability;
  focusDistance?: TAdvancedCapability;
  sharpness?: TAdvancedCapability;
  saturation?: TAdvancedCapability;
  brightness?: TAdvancedCapability;
  contrast?: TAdvancedCapability;
  colorTemperature?: TAdvancedCapability;
  focusMode?: TConstraintModeType;
  whiteBalanceMode?: TConstraintModeType;
};
