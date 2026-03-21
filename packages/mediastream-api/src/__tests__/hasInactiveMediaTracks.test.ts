/// <reference types="jest" />
import createMediaStreamMock from '../__fixtures__/createMediaStreamMock';
import hasInactiveMediaTracks from '../hasInactiveMediaTracks';

describe('hasInactiveMediaTracks', () => {
  let mediaStream: MediaStream;

  beforeEach(() => {
    mediaStream = createMediaStreamMock({
      videoDeviceId: 'videoDeviceId',
      audioDeviceId: 'audioDeviceId',
      width: 800,
      height: 600,
    });
  });

  it('#1 should be active media tracks when has "live" track ready state', () => {
    const isInactiveStreamTracks = hasInactiveMediaTracks(mediaStream.getTracks());

    expect(isInactiveStreamTracks).toBe(false);
  });

  it('#2 should be inactive media tracks when has another track ready state', () => {
    mediaStream.getTracks()[0].stop();

    const isInactiveStreamTracks = hasInactiveMediaTracks(mediaStream.getTracks());

    expect(isInactiveStreamTracks).toBe(true);
  });
});
