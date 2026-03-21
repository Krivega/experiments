/// <reference types="jest" />
import { AudioContextMock } from '../__test-utils__';
import playTone from '../playTone';

describe('playTone', () => {
  let audioContext: AudioContext;
  let onEndMocked: () => void;
  let resolveOnEndedPlayTone: () => void;

  const tone = '1';
  const soundDurationInMilliseconds = 100;

  beforeEach(() => {
    onEndMocked = jest.fn();

    audioContext = new AudioContextMock() as unknown as AudioContext;
  });

  it('#1 should be played tone through audio context buffer', () => {
    expect.assertions(3);

    const baseBufferSource = audioContext.createBufferSource();

    expect(baseBufferSource.buffer?.getChannelData(0)).toBe(undefined);

    audioContext.createBufferSource = () => {
      baseBufferSource.start = () => {
        expect(baseBufferSource.buffer?.getChannelData(0)).toBeDefined();
        expect(baseBufferSource.buffer?.getChannelData(0).length).toBe(4410);
      };

      return baseBufferSource;
    };

    playTone({
      tone,
      audioContext,
      soundDurationInMilliseconds,
      destination: audioContext.destination,
    });
  });

  it('#2 should be called onEnd method after tone playing', async () => {
    expect.assertions(1);

    playTone({
      tone,
      audioContext,
      soundDurationInMilliseconds,
      destination: audioContext.destination,
      onEnd: () => {
        onEndMocked();
        resolveOnEndedPlayTone();
      },
    });

    return new Promise<void>((resolve) => {
      resolveOnEndedPlayTone = resolve;
    }).then(() => {
      expect(onEndMocked).toHaveBeenCalledTimes(1);
    });
  });
});
