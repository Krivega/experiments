import { sequentPromises } from 'sequent-promises';

import prepareConstraints from './prepareConstraints';

import type { TOptionsPrepareConstraints } from './prepareConstraints';

const isObject = (object: unknown) => {
  return typeof object === 'object' && !Array.isArray(object) && object !== null;
};

export const isNotUpdatableConstraint = (constraint: MediaTrackConstraints) => {
  return (isObject(constraint) && Object.keys(constraint).length === 0) || !isObject(constraint);
};

const updateMediaStreamConstraints = async (
  mediaStream: MediaStream,
  optionsConstraints: TOptionsPrepareConstraints,
) => {
  const constraints = prepareConstraints(optionsConstraints);

  return sequentPromises(
    mediaStream.getTracks().map((track) => {
      return async () => {
        const kind = track.kind as 'audio' | 'video';
        const constraintsByKind = constraints[kind] as MediaTrackConstraints;

        if (isNotUpdatableConstraint(constraintsByKind)) {
          // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
          return Promise.resolve();
        }

        return track.applyConstraints(constraintsByKind);
      };
    }),
  ).then(() => {
    return mediaStream;
  });
};

export default updateMediaStreamConstraints;
