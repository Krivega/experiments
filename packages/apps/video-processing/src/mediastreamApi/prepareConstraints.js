/* eslint-disable require-jsdoc, no-console, import/no-extraneous-dependencies */

import { resolveSetConstraints, resolveSetProp } from './utils';

const isEmpty = require('lodash/isEmpty');

/**
 * prepareConstraints
 * @param {Object} param param
 * @returns {Object} {audio video}
 */
const prepareConstraints = ({
  audio = true,
  video = true,
  audioDeviceId,
  videoDeviceId,
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  aspectRatio,
  videoMandatory,
  mozMediaSource,
  mediaSource,
  echoCancellation,
}) => {
  let videoConstraints = {};
  const resolveSetVideoConstraints = resolveSetConstraints(videoConstraints);
  const setExactVideoConstraints = resolveSetVideoConstraints('exact');
  const setIdealVideoConstraints = resolveSetVideoConstraints('ideal');
  const setMaxVideoConstraints = resolveSetVideoConstraints('max');
  const setMinVideoConstraints = resolveSetVideoConstraints('min');
  const setPropVideoConstraints = resolveSetProp(videoConstraints);

  let audioConstraints = audioDeviceId ? audio : false;

  if (audioDeviceId && audio) {
    audioConstraints = {
      deviceId: { exact: audioDeviceId },
      echoCancellation,
    };
  }

  setPropVideoConstraints('mozMediaSource', mozMediaSource);
  setPropVideoConstraints('mediaSource', mediaSource);
  setExactVideoConstraints('deviceId', videoDeviceId);
  setIdealVideoConstraints('width', width);
  setIdealVideoConstraints('height', height);
  setIdealVideoConstraints('aspectRatio', aspectRatio);
  setMaxVideoConstraints('width', maxWidth);
  setMaxVideoConstraints('height', maxHeight);
  setMinVideoConstraints('width', minWidth);
  setMinVideoConstraints('height', minHeight);

  if (videoMandatory) {
    videoConstraints.mandatory = videoMandatory;
  }

  if (isEmpty(videoConstraints)) {
    videoConstraints = true;
  }

  return {
    audio: audioConstraints,
    video: video ? videoConstraints : false,
  };
};

export default prepareConstraints;
