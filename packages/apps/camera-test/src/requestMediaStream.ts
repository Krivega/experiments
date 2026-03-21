import { getMediaStreamOrigin } from '@experiments/mediastream-api';
import stopTracksMediaStream from '@experiments/mediastream-api/src/stopTracksMediaStream';

const requestMediaStream = async ({
  mediaStream,
  setMediaStream,
  setIsLoading,
  setTrackSettings,
  onSuccess = () => {},
  onFail = (_error: Error) => {},
  constraints = {},
}: {
  mediaStream: MediaStream | null;
  constraints: MediaTrackConstraints;
  onSuccess?: () => void;
  onFail: (error: Error) => void;
  setMediaStream: (mediaStream: MediaStream) => void;
  setIsLoading: (isLoading: boolean) => void;
  setTrackSettings: (settings: MediaTrackSettings) => void;
}): Promise<MediaStream | undefined> => {
  setIsLoading(true);

  return Promise.resolve()
    .then(async () => {
      if (mediaStream) {
        await stopTracksMediaStream(mediaStream);
      }

      return undefined;
    })
    .then(async () => {
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

      return resultMediaStream;
    })
    .catch((error: unknown) => {
      onFail(error as Error);

      return undefined;
    })
    .finally(() => {
      setIsLoading(false);
    });
};

export default requestMediaStream;
