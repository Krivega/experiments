/// <reference types="jest" />
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { resolvePlayTone } from '..';
import { AudioContextMock } from '../__test-utils__';
import AudioContext from '../AudioContext';

jest.mock('../AudioContext');

describe('resolvePlayTone', () => {
  it('#1 should be played tone through audio context buffer', () => {
    expect.assertions(3);

    // @ts-expect-error
    AudioContext.mockImplementation(() => {
      const audioContextMock = new AudioContextMock();

      const actualBufferSource = audioContextMock.createBufferSource();

      expect(actualBufferSource.buffer?.getChannelData(0)).toBe(undefined);

      audioContextMock.createBufferSource = () => {
        actualBufferSource.start = () => {
          expect(actualBufferSource.buffer?.getChannelData(0)).toBeDefined();
          expect(actualBufferSource.buffer?.getChannelData(0).length).toBe(13_230);
        };

        return actualBufferSource;
      };

      return audioContextMock;
    });

    const playTone = resolvePlayTone('1');

    playTone();
  });

  it('#2 should be returned object with stop method', () => {
    const playTone = resolvePlayTone('1');

    const { stop } = playTone();

    expect(stop).toBeDefined();
  });

  it('#3 should be stopped tone playing when stop-method has called', () => {
    expect.assertions(2);

    const closeAudioContextMocked = jest.fn(async () => {});
    const disconnectBufferSourceMocked = jest.fn();

    // @ts-expect-error
    AudioContext.mockImplementation(() => {
      const { default: ActualAudioContext } = jest.requireActual('../AudioContext');

      const actualAudioContext = new ActualAudioContext();

      const actualBufferSource = actualAudioContext.createBufferSource();

      actualAudioContext.createBufferSource = () => {
        actualBufferSource.disconnect = disconnectBufferSourceMocked;

        return actualBufferSource;
      };

      actualAudioContext.close = closeAudioContextMocked;

      return actualAudioContext;
    });

    const playTone = resolvePlayTone('1');

    const { stop } = playTone();

    stop();

    expect(closeAudioContextMocked).toHaveBeenCalledTimes(1);
    expect(disconnectBufferSourceMocked).toHaveBeenCalledTimes(1);
  });

  it('#4 should handle audioContext.close() error', () => {
    const closeAudioContextMocked = jest.fn(async () => {
      throw new Error('Close failed');
    });
    const disconnectBufferSourceMocked = jest.fn();

    // @ts-expect-error
    AudioContext.mockImplementation(() => {
      const { default: ActualAudioContext } = jest.requireActual('../AudioContext');

      const actualAudioContext = new ActualAudioContext();

      const actualBufferSource = actualAudioContext.createBufferSource();

      actualAudioContext.createBufferSource = () => {
        actualBufferSource.disconnect = disconnectBufferSourceMocked;

        return actualBufferSource;
      };

      actualAudioContext.close = closeAudioContextMocked;

      return actualAudioContext;
    });

    const playTone = resolvePlayTone('1');

    const { stop } = playTone();

    // Should not throw error even if close() fails
    expect(() => {
      stop();
    }).not.toThrow();
    expect(closeAudioContextMocked).toHaveBeenCalledTimes(1);
    expect(disconnectBufferSourceMocked).toHaveBeenCalledTimes(1);
  });
});
