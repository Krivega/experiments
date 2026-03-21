import { sequentPromises } from 'sequent-promises';

import { hasCapability } from './utils';

import type {
  MediaTrackCapabilitiesExtended,
  TAvailableSetting,
  TAvailableSettings,
  TKeyMediaTrackSettings,
} from './typings';

const sendConstraintsSequently = async (
  videoTrack: MediaStreamVideoTrack,
  constraintsState: TAvailableSettings,
): Promise<void> => {
  const settings = videoTrack.getSettings();
  const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilitiesExtended;

  const constraintsEntries = Object.entries(constraintsState) as [
    TKeyMediaTrackSettings,
    TAvailableSetting,
  ][];
  const constraintsSenders = constraintsEntries
    .filter(([key, constraint]: [TKeyMediaTrackSettings, TAvailableSetting]) => {
      const setting = settings[key];

      return hasCapability(capabilities, key) && constraint.value !== setting;
    })
    .map(([constraintName, constraint]: [string, TAvailableSetting]) => {
      return async () => {
        const { value, mode = {} } = constraint;

        const advancedConstraints = { ...mode, [constraintName]: value };

        return videoTrack.applyConstraints({ advanced: [advancedConstraints] });
      };
    });

  return sequentPromises(constraintsSenders).then(() => {});
};

export default sendConstraintsSequently;
