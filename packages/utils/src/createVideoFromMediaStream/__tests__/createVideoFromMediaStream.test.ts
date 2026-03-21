/// <reference types="jest" />
import { MediaStreamMock } from 'webrtc-mock';

import createVideoFromMediaStream from '..';

describe('createVideoFromMediaStream', () => {
  let mediaStreamMock: MediaStream;

  beforeEach(() => {
    mediaStreamMock = new MediaStreamMock() as unknown as MediaStream;

    global.document.createElement = jest.fn().mockImplementation(() => {
      return {
        addEventListener: (_eventName: string, callback: () => void) => {
          callback();
        },
      };
    });
  });

  it('#1 should be created video element by media stream', async () => {
    expect.assertions(4);

    return createVideoFromMediaStream(mediaStreamMock).then((video) => {
      expect(video).toBeDefined();
      expect(video.srcObject).toBe(mediaStreamMock);
      expect(video.muted).toBe(true);
      expect(video.autoplay).toBe(true);
    });
  });
});
