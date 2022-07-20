import getResolutionById from '@experiments/system-devices/src/getResolutionById';
import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';
import { getMediaStream } from '@experiments/mediastream-api';
import type { TVideoConstraints } from './typings';

const requestMediaStream = ({
  mediaStream,
  setMediaStream,
  setIsLoading,
  videoDeviceId,
  resolutionId,
  videoDeviceList,
  audioInputDeviceId,
  additionalConstraints = {},
}: {
  mediaStream: MediaStream | null;
  videoDeviceId: string;
  audioInputDeviceId: string;
  resolutionId: string;
  videoDeviceList: MediaDeviceInfo[];
  additionalConstraints?: TVideoConstraints;
  setMediaStream: (mediaStream: MediaStream) => void;
  setIsLoading: (isLoading: boolean) => void;
}): Promise<MediaStream | void> | void => {
  setIsLoading(true);

  if (!videoDeviceId || !resolutionId || videoDeviceList.length === 0 || !audioInputDeviceId) {
    setIsLoading(false);

    return undefined;
  }

  const resolution = getResolutionById(resolutionId);

  if (!resolution) {
    setIsLoading(false);

    return undefined;
  }

  const { width, height } = resolution;

  return Promise.resolve()
    .then(() => {
      if (mediaStream) {
        return stopTracksMediaStream(mediaStream);
      }

      return undefined;
    })
    .then(() => {
      return getMediaStream({
        audio: true,
        video: true,
        audioDeviceId: audioInputDeviceId,
        videoDeviceId,
        width,
        height,
        ...additionalConstraints,
      });
    })
    .then(setMediaStream)
    .finally(() => {
      setIsLoading(false);
    });
};

export default requestMediaStream;
