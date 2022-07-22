import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';
import { getMediaStreamOrigin } from '@experiments/mediastream-api';

const requestMediaStream = ({
  mediaStream,
  setMediaStream,
  setIsLoading,
  setTrackSettings,
  onSuccess = () => {},
  onFail = (error: Error) => {},
  constraints = {},
}: {
  mediaStream: MediaStream | null;
  constraints: MediaTrackConstraints;
  onSuccess?: () => void;
  onFail: (error: Error) => void;
  setMediaStream: (mediaStream: MediaStream) => void;
  setIsLoading: (isLoading: boolean) => void;
  setTrackSettings: (settings: MediaTrackSettings) => void;
}): Promise<MediaStream | void> => {
  setIsLoading(true);

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
        video: constraints,
      });
    })
    .then((resultMediaStream: MediaStream) => {
      onSuccess();
      setMediaStream(resultMediaStream);

      const settings = resultMediaStream.getVideoTracks()[0].getSettings();

      setTrackSettings(settings);
    })
    .catch(onFail)
    .finally(() => {
      setIsLoading(false);
    });
};

export default requestMediaStream;
