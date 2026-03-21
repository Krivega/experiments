import { SetTimeoutRequest } from '@experiments/timeout-requester';

import stopTracksMediaStream from './stopTracksMediaStream';

const WAIT_TIMEOUT_DEFAULT = 20_000;

const getMediaStreamOrigin = async (
  constraints?: MediaStreamConstraints,
  { waitTimeout = WAIT_TIMEOUT_DEFAULT } = {},
): Promise<MediaStream> => {
  const setTimeoutRequest = new SetTimeoutRequest();

  const getMediasStreamPromise = Promise.resolve()
    // for catch "undefined is not an object navigator.mediaDevices.enumerateDevices"
    .then(async () => {
      return navigator.mediaDevices.getUserMedia(constraints);
    });

  const waitingPromise = new Promise<MediaStream>((_resolve, reject) => {
    setTimeoutRequest.request(() => {
      const error = new Error(
        `Waiting time is ending for constraints ${JSON.stringify(constraints)}`,
      );

      getMediasStreamPromise
        .then(async (mediaStream) => {
          return stopTracksMediaStream(mediaStream);
        })
        .catch((error_: unknown) => {
          reject(error_ as Error);
        });

      reject(error);
    }, waitTimeout);
  });

  return Promise.race([getMediasStreamPromise, waitingPromise])
    .then((mediaStream) => {
      setTimeoutRequest.cancelRequest();

      return mediaStream;
    })
    .catch((error: unknown) => {
      throw error;
    });
};

export default getMediaStreamOrigin;

export { hasCanceledError as hasCanceledErrorMediaStreamOrigin } from '@experiments/timeout-requester';
