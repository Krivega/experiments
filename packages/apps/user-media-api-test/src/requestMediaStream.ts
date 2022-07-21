import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';
import { getMediaStreamOrigin } from '@experiments/mediastream-api';
import type { TVideoConstraints } from './typings';

const requestMediaStream = ({
  mediaStream,
  setMediaStream,
  setIsLoading,
  videoDeviceId,
  videoDeviceList,
  setTrackSettings,
  onSuccess = () => {},
  onFail = (error: Error) => {},
  additionalConstraints = {},
}: {
  mediaStream: MediaStream | null;
  videoDeviceId: string;
  videoDeviceList: MediaDeviceInfo[];
  additionalConstraints?: TVideoConstraints;
  onSuccess?: () => void;
  onFail: (error: Error) => void;
  setMediaStream: (mediaStream: MediaStream) => void;
  setIsLoading: (isLoading: boolean) => void;
  setTrackSettings;
}): Promise<MediaStream | void> | void => {
  setIsLoading(true);

  if (!videoDeviceId || videoDeviceList.length === 0) {
    setIsLoading(false);

    return undefined;
  }

  return Promise.resolve()
    .then(() => {
      if (mediaStream) {
        return stopTracksMediaStream(mediaStream);
      }

      return undefined;
    })
    .then(() => {
      return getMediaStreamOrigin({
        audio: false,
        video: { deviceId: videoDeviceId, ...additionalConstraints },
      });
    })
    .then((resultMediaStream: MediaStream) => {
      onSuccess();
      setMediaStream(resultMediaStream);

      resultMediaStream.getVideoTracks()[0].getSettings();

      setTrackSettings(() => {
        const settingsFiltered = Object.fromEntries(
          Object.entries(resultMediaStream.getVideoTracks()[0].getSettings()).filter(([key]) => {
            return key !== 'deviceId' && key !== 'groupId';
          })
        );

        return settingsFiltered;
      });
    })
    .catch(onFail)
    .finally(() => {
      setIsLoading(false);
    });
};

export default requestMediaStream;
