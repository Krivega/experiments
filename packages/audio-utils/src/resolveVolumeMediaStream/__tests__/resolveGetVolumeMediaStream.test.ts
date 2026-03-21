/// <reference types="jest" />
import { createAudioMediaStreamTrackMock } from 'webrtc-mock';

import { resolveVolumeMediaStream } from '../..';

describe('resolveVolumeMediaStream', () => {
  it('getVolumeMediaStream', () => {
    const mediaStream = new MediaStream([
      createAudioMediaStreamTrackMock() as unknown as MediaStreamTrack,
    ]);

    const { getVolume } = resolveVolumeMediaStream(mediaStream);
    const volume = getVolume();

    expect(volume).toBe(0);
  });
});
