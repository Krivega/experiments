import { resolveSetConstraints, resolveSetProperty } from './utils';

export type TOptionsPrepareConstraints = {
  audio?: boolean;
  video?: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  width?: number | string;
  height?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  aspectRatio?: number | string;
  mozMediaSource?: unknown;
  mediaSource?: unknown;
  echoCancellation?: boolean;
  sampleRate?: number;
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
  sampleRate,
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
  const setPropertyVideoConstraints = resolveSetProperty(videoConstraints);

  let audioConstraints: MediaTrackConstraints | boolean =
    audioDeviceId === undefined ? false : audio;

  if (audioDeviceId !== undefined && audio) {
    audioConstraints = {
      deviceId: { exact: audioDeviceId },
      echoCancellation,
      sampleRate,
    };
  }

  // @ts-ignore
  setPropertyVideoConstraints('mozMediaSource', mozMediaSource);
  // @ts-ignore
  setPropertyVideoConstraints('mediaSource', mediaSource);
  setExactVideoConstraints('deviceId', videoDeviceId);
  setIdealVideoConstraints('width', width);
  setIdealVideoConstraints('height', height);
  setIdealVideoConstraints('aspectRatio', aspectRatio);
  setMaxVideoConstraints('width', maxWidth);
  setMaxVideoConstraints('height', maxHeight);
  setMinVideoConstraints('width', minWidth);
  setMinVideoConstraints('height', minHeight);

  if (Object.keys(videoConstraints).length === 0) {
    videoConstraints = true;
  }

  return {
    audio: audioConstraints,
    video: video ? videoConstraints : false,
  };
};

export default prepareConstraints;
