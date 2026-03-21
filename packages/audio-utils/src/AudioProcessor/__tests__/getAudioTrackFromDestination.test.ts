/// <reference types="jest" />
import getAudioTrackFromDestination from '../getAudioTrackFromDestination';

describe('getAudioTrackFromDestination', () => {
  it('#1 should be returned audio track with destination and context', () => {
    const audioContext = new AudioContext();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const audioTrack = getAudioTrackFromDestination(mediaStreamDestination);

    expect(audioTrack).toBeDefined();
    expect(audioTrack.kind).toBe('audio');
  });
});
