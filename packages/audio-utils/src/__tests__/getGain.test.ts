/// <reference types="jest" />
import { createAudioMediaStreamTrackMock } from 'webrtc-mock';

import getGain from '../getGain';

describe('getGain', () => {
  it('work', () => {
    const audioContext = new AudioContext();
    const audioTrackSource = createAudioMediaStreamTrackMock() as unknown as MediaStreamTrack;
    const { gainNode, mediaStreamAudioDestinationNode } = getGain(audioContext, audioTrackSource);

    expect(gainNode).toBeDefined();
    expect(mediaStreamAudioDestinationNode.numberOfInputs).toBe(1);
    expect(mediaStreamAudioDestinationNode.numberOfOutputs).toBe(0);
  });
});
