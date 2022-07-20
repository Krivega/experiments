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
  onSuccess = () => {},
  onFail = (error: Error) => {},
  additionalConstraints = {},
}: {
  mediaStream: MediaStream | null;
  videoDeviceId: string;
  resolutionId: string;
  videoDeviceList: MediaDeviceInfo[];
  additionalConstraints?: TVideoConstraints;
  onSuccess?: () => void;
  onFail: (error: Error) => void;
  setMediaStream: (mediaStream: MediaStream) => void;
  setIsLoading: (isLoading: boolean) => void;
}): Promise<MediaStream | void> | void => {
  setIsLoading(true);

  if (!videoDeviceId || !resolutionId || videoDeviceList.length === 0) {
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
        video: true,
        videoDeviceId,
        width,
        height,
        ...additionalConstraints,
      });
    })
    .then((resultMediaStream: MediaStream) => {
      onSuccess();
      setMediaStream(resultMediaStream);
    })
    .catch(onFail)
    .finally(() => {
      setIsLoading(false);
    });
};

export default requestMediaStream;
