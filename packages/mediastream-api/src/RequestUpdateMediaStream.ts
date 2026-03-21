import { cancelablePromise } from '@krivega/cancelable-promise';

import updateMediaStreamConstraints from './updateMediaStreamConstraints';

import type { ICancelablePromise } from '@krivega/cancelable-promise';
import type { TOptionsPrepareConstraints } from './prepareConstraints';

export default class RequestUpdateMediaStream {
  public requested = false;

  private requestObj?: ICancelablePromise<MediaStream>;

  public async updateConstraints(
    mediaStream: MediaStream,
    constraints: TOptionsPrepareConstraints,
  ) {
    this.requested = true;
    this.cancelRequest();

    this.requestObj = this.updateCancelableMediaStreamConstraints(mediaStream, constraints);

    await this.requestObj;

    this.requested = false;

    return this.requestObj;
  }

  public async updateConstraintsVideoTrack(
    videoTrack: MediaStreamVideoTrack,
    constraints: TOptionsPrepareConstraints,
  ): Promise<MediaStreamVideoTrack> {
    return this.updateConstraints(new MediaStream([videoTrack]), constraints).then(
      (mediaStream) => {
        return mediaStream.getVideoTracks()[0];
      },
    );
  }

  public cancelRequest() {
    const request = this.requestObj;

    if (request) {
      request.cancel();
    }
  }

  private updateCancelableMediaStreamConstraints(
    mediaStream: MediaStream,
    constraints: TOptionsPrepareConstraints,
  ): ICancelablePromise<MediaStream> {
    return cancelablePromise<MediaStream>(updateMediaStreamConstraints(mediaStream, constraints), {
      moduleName: this.constructor.name,
    });
  }
}

export { isCanceledError as hasCanceledErrorRequestUpdateMediaStream } from '@krivega/cancelable-promise';
