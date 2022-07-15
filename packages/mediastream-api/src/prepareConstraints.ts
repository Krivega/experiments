import { resolveSetConstraints, resolveSetProp } from './utils';

const isEmpty = require('lodash/isEmpty');

type TOptionsPrepareConstraints = {
  audio?: boolean;
  video?: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  width?: string | number;
  height?: string | number;
  maxWidth?: string | number;
  maxHeight?: string | number;
  minWidth?: string | number;
  minHeight?: string | number;
  aspectRatio?: string | number;
  mozMediaSource?: any;
  mediaSource?: any;
  echoCancellation?: boolean;
};

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
  mozMediaSource,
  mediaSource,
  echoCancellation,
}: TOptionsPrepareConstraints): {
  audio: MediaTrackConstraints | boolean;
  video: MediaTrackConstraints | boolean;
} => {
  let videoConstraints: MediaTrackConstraints | boolean = {};
  const resolveSetVideoConstraints = resolveSetConstraints(videoConstraints);
  const setExactVideoConstraints = resolveSetVideoConstraints('exact');
  const setIdealVideoConstraints = resolveSetVideoConstraints('ideal');
  const setMaxVideoConstraints = resolveSetVideoConstraints('max');
  const setMinVideoConstraints = resolveSetVideoConstraints('min');
  const setPropVideoConstraints = resolveSetProp(videoConstraints);

  let audioConstraints: MediaTrackConstraints | boolean = audioDeviceId ? audio : false;

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

  if (isEmpty(videoConstraints)) {
    videoConstraints = true;
  }

  return {
    audio: audioConstraints,
    video: video ? videoConstraints : false,
  };
};

export default prepareConstraints;
