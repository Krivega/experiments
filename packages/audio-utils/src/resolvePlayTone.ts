import AudioContext from './AudioContext';
import logger from './logger';
import playTone from './playTone';

import type { TTone } from './typings';

const PLAY_TIMEOUT = 300 as const;

const loggerResolvePlayTone = logger.extend('resolvePlayTone');

const resolvePlayTone = (tone: TTone, volume?: number) => {
  return () => {
    const audioContext = new AudioContext();

    loggerResolvePlayTone('new AudioContext()');

    const cancel = playTone({
      tone,
      volume,
      audioContext,
      destination: audioContext.destination,
      soundDurationInMilliseconds: PLAY_TIMEOUT,
    });

    loggerResolvePlayTone('new AudioContext() audioContext.state: %0', {
      stateAudioContext: audioContext.state,
    });

    return {
      stop: () => {
        loggerResolvePlayTone('stop');

        cancel();
        audioContext.close().catch((error: unknown) => {
          logger('failed to close audio context - error:', error);
        });
      },
    };
  };
};

export default resolvePlayTone;
