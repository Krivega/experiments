import logger from './logger';
import setSinkId from './setSinkId';
import setVolume from './setVolume';

import type { TCreateAudioPLayer } from './typings';

const loggerCreateAudioPlayer = logger.extend('createAudioPlayer');

let stop = async () => {};
let cancelPlay = async () => {};

let setVolumeInternal = (_volumeLevel: number) => {};

const createAudioPlayer: TCreateAudioPLayer = ({ url, sinkId, loop = false, volume = 1 }) => {
  loggerCreateAudioPlayer('params: %o', { url, sinkId, loop, volume });

  let isStopped = false;
  const play = async (): Promise<void> => {
    loggerCreateAudioPlayer('play');

    if (isStopped) {
      return;
    }

    let audio: HTMLAudioElement | undefined = new Audio(url);

    audio.loop = loop;

    stop = async () => {
      loggerCreateAudioPlayer('stop');

      return cancelPlay().then(() => {
        loggerCreateAudioPlayer('stop: then cancelPlay');

        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.src = '';

          audio.addEventListener(
            'play',
            (event: Event) => {
              const target = event.target as HTMLAudioElement;

              loggerCreateAudioPlayer('stop: event: "play" target: %o', { target });

              target.pause();
            },
            { once: true },
          );
        }

        audio = undefined;
        loggerCreateAudioPlayer('stop: then cancelPlay undefined');
        cancelPlay = async () => {};
        stop = async () => {};
      });
    };

    setVolumeInternal = (volumeLevel: number) => {
      loggerCreateAudioPlayer('setVolumeInternal volumeLevel isAudio: %o', {
        volumeLevel,
        isAudio: !!audio,
      });

      if (audio) {
        setVolume(audio, volumeLevel, logger);
      }
    };

    const handleLoadAudio = async () => {
      return new Promise<void>((resolve, reject) => {
        if (audio) {
          audio.volume = volume;
        }

        let playPromised = Promise.resolve();
        const handleCanplaythrough = () => {
          loggerCreateAudioPlayer('play:canplaythrough');

          if (audio) {
            playPromised = audio
              .play()
              .then(() => {
                loggerCreateAudioPlayer('play:then');
              })
              .catch((error: unknown) => {
                loggerCreateAudioPlayer('play:catch', error);

                reject(error as Error);
              });
          }
        };

        const handleEnded = () => {
          loggerCreateAudioPlayer('play:ended');
          resolve();
        };

        audio?.addEventListener('ended', handleEnded, {
          once: true,
        });
        audio?.addEventListener('canplaythrough', handleCanplaythrough, {
          once: true,
        });

        cancelPlay = async () => {
          loggerCreateAudioPlayer('play:cancelPlay');
          audio?.removeEventListener('ended', handleEnded);
          audio?.removeEventListener('canplaythrough', handleCanplaythrough);

          return playPromised.then(resolve);
        };

        audio?.load();
      });
    };

    await setSinkId(audio, sinkId, logger).then(handleLoadAudio);
  };

  return {
    async stop() {
      isStopped = true;

      return stop();
    },
    async play() {
      isStopped = false;

      return play();
    },
    setVolume(volumeLevel: number) {
      setVolumeInternal(volumeLevel);
    },
  };
};

export default createAudioPlayer;
