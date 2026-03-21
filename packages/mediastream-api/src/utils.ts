/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-param-reassign */
import type {
  MediaTrackCapabilitiesExtended,
  TKeyMediaTrackCapabilities,
  TKeyMediaTrackConstraints,
  TValueMediaTrackConstraints,
} from './typings';

export const resolveSetConstraints = (constraints: MediaTrackConstraints) => {
  return (type: 'exact' | 'ideal' | 'max' | 'min') => {
    return (key: TKeyMediaTrackConstraints, value: TValueMediaTrackConstraints) => {
      if (!value) {
        return;
      }

      // @ts-ignore
      constraints[key] ??= {};

      // @ts-ignore
      Object.assign(constraints[key], { [type]: value });
    };
  };
};

export const resolveSetProperty = (constraints: MediaTrackConstraints) => {
  return (key: TKeyMediaTrackConstraints, value: TValueMediaTrackConstraints) => {
    if (value) {
      // @ts-ignore
      constraints[key] = value;
    }
  };
};

export const hasCapability = (
  capabilities: MediaTrackCapabilitiesExtended,
  key: TKeyMediaTrackCapabilities,
) => {
  const capability = capabilities[key];

  if (capability === undefined) {
    return false;
  }

  if (typeof capability === 'boolean') {
    return capability;
  }

  if (typeof capability === 'string') {
    return capability !== '';
  }

  return !!capability;
};
