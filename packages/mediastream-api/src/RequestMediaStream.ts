import { CancelableRequest } from '@krivega/cancelable-promise';

import getMediaStream from './getMediaStream';
import stopTracksMediaStream from './stopTracksMediaStream';

import type prepareConstraints from './prepareConstraints';

const onCancelMediaStreamRequest = (basePromise: Promise<MediaStream>) => {
  basePromise.then(stopTracksMediaStream).catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.log('basePromise.then ~ error:', error);
  });
};

const createCancelableMediaStreamRequester = (
  moduleName = 'createCancelableMediaStreamRequester',
) => {
  const cancelableRequest = new CancelableRequest(getMediaStream, {
    moduleName,
    afterCancelRequest: onCancelMediaStreamRequest,
  });

  return cancelableRequest;
};

export default class RequestMediaStream {
  private readonly cancelableMediaStreamRequester: ReturnType<
    typeof createCancelableMediaStreamRequester
  >;

  public constructor() {
    this.cancelableMediaStreamRequester = createCancelableMediaStreamRequester();
  }

  public get requested() {
    return this.cancelableMediaStreamRequester.requested;
  }

  public request = async (
    constraints: Parameters<typeof prepareConstraints>[0] = {},
    options = {},
  ): Promise<MediaStream> => {
    const mediaStream = await this.cancelableMediaStreamRequester.request({
      options,
      optionsConstraints: constraints,
    });

    return mediaStream;
  };

  public requestAudioTrack = async (
    constraints = {},
    options = {},
  ): Promise<MediaStreamAudioTrack> => {
    return this.request(constraints, options).then((mediaStream: MediaStream) => {
      return mediaStream.getAudioTracks()[0];
    });
  };

  public requestVideoTrack = async (
    constraints = {},
    options = {},
  ): Promise<MediaStreamVideoTrack> => {
    return this.request(constraints, options).then((mediaStream: MediaStream) => {
      return mediaStream.getVideoTracks()[0];
    });
  };

  public cancelRequest() {
    this.cancelableMediaStreamRequester.cancelRequest();
  }
}

export { isCanceledError as hasCanceledErrorRequestMediaStream } from '@krivega/cancelable-promise';
export type { TErrorCanceled } from '@krivega/cancelable-promise';
