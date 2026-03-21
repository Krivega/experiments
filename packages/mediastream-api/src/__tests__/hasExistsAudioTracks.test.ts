/// <reference types="jest" />
import createMediaStreamMock from '../__fixtures__/createMediaStreamMock';
import hasExistsAudioTracks from '../hasExistsAudioTracks';

describe('hasExistsAudioTracks', () => {
  let mediaStreamMock: MediaStream;

  it('should be truthy when mediastream has included audio tracks', () => {
    mediaStreamMock = createMediaStreamMock({
      audioDeviceId: 'audioDeviceId',
      videoDeviceId: 'videoDeviceId',
    });

    const isExistsAudioTracks = hasExistsAudioTracks(mediaStreamMock);

    expect(isExistsAudioTracks).toBe(true);
  });

  it('should be falsy when mediastream has not included audio tracks', () => {
    mediaStreamMock = createMediaStreamMock({
      videoDeviceId: 'videoDeviceId',
    });

    const isExistsAudioTracks = hasExistsAudioTracks(mediaStreamMock);

    expect(isExistsAudioTracks).toBe(false);
  });
});
