/// <reference types="jest" />
/* eslint-disable max-classes-per-file */
import { createAudioPlayer } from '..';
import AudioMock from '../__fixtures__/AudioMock';

let loadMocked: jest.Mock;
let setSinkIdMocked: jest.Mock;
let pauseMocked: jest.Mock;

let dispatchPlay: () => void;

class AudioMocked extends AudioMock {
  public load = () => {
    setTimeout(() => {
      this.dispatchEvent(new Event('canplaythrough'));
      loadMocked();
    }, 100);

    dispatchPlay = () => {
      this.dispatchEvent(new Event('play'));
    };
  };

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public setSinkId = async (url: string) => {
    setSinkIdMocked(url);
  };

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public pause = () => {
    pauseMocked();
  };
}

global.Audio = AudioMocked;

describe('createAudioPlayer', () => {
  beforeEach(() => {
    loadMocked = jest.fn();
    setSinkIdMocked = jest.fn();
    pauseMocked = jest.fn();
  });

  it('#1 should be played audio', async () => {
    const url = 'url';
    const sinkId = 'sinkId';
    const audioPlayer = createAudioPlayer({ url, sinkId });

    await audioPlayer.play();

    expect(loadMocked).toHaveBeenCalledTimes(1);
    expect(setSinkIdMocked).toHaveBeenCalledTimes(1);
    expect(setSinkIdMocked).toHaveBeenCalledWith(sinkId);
  });

  it('#2 should be stopped audio', async () => {
    const url = 'url';
    const sinkId = 'sinkId';
    const audioPlayer = createAudioPlayer({ url, sinkId });

    await audioPlayer.play();
    await audioPlayer.stop();

    expect(pauseMocked).toHaveBeenCalledTimes(1);
  });

  it('#3 should not be errors when player has stopped before start', async () => {
    const url = 'url';
    const sinkId = 'sinkId';
    const audioPlayer = createAudioPlayer({ url, sinkId });

    await audioPlayer.stop();

    expect(pauseMocked).toHaveBeenCalledTimes(0);
  });

  it('#4 should be stopped audio when player is stopped and dom-element has dispatched play event', async () => {
    const url = 'url';
    const sinkId = 'sinkId';
    const audioPlayer = createAudioPlayer({ url, sinkId });

    await audioPlayer.play();
    await audioPlayer.stop();

    expect(pauseMocked).toHaveBeenCalledTimes(1);

    dispatchPlay();

    expect(pauseMocked).toHaveBeenCalledTimes(2);
  });

  it('#5 should not call setVolume after stop', async () => {
    jest.doMock('../setVolume', () => {
      return {
        __esModule: true,
        default: jest.fn(),
      };
    });

    const url = 'url';
    const sinkId = 'sinkId';
    const audioPlayer = createAudioPlayer({ url, sinkId });

    await audioPlayer.play();
    await audioPlayer.stop();
    audioPlayer.setVolume(50);

    // eslint-disable-next-line global-require, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, unicorn/prefer-module
    const setVolume = require('../setVolume').default;

    expect(setVolume).toHaveBeenCalledTimes(0);
  });

  it('#6 should handle audio play errors', async () => {
    const audioUrl = 'url';
    const sinkId = 'sinkId';

    class AudioWithPlayError extends AudioMock {
      public load = () => {
        setTimeout(() => {
          this.dispatchEvent(new Event('canplaythrough'));
          loadMocked();
        }, 100);
      };

      public play = async () => {
        this.currentTime = 0; // Use this to satisfy linter
        throw new Error('Play failed');
      };

      // eslint-disable-next-line @typescript-eslint/class-methods-use-this
      public setSinkId = async (deviceId: string) => {
        setSinkIdMocked(deviceId);
      };

      // eslint-disable-next-line @typescript-eslint/class-methods-use-this
      public pause = () => {
        pauseMocked();
      };
    }

    global.Audio = AudioWithPlayError;

    const audioPlayer = createAudioPlayer({ url: audioUrl, sinkId });

    await expect(audioPlayer.play()).rejects.toThrow('Play failed');
  });
});
