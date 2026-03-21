import { CancelableRequest } from '@krivega/cancelable-promise';

import logger from '../logger';
import playTone from '../playTone';

import type { TTone } from '../typings';

const loggerTonalProcessor = logger.extend('TonalProcessor');

const HALF_SECOND = 500 as const;

type TPlayWrapped = (onEnd: () => void) => () => void;

class TonalProcessor {
  private readonly audioContext: AudioContext;

  private readonly soundDurationInMilliseconds: number;

  private readonly mediaStreamDestination: MediaStreamAudioDestinationNode;

  private readonly cancellablePlayPromised: CancelableRequest<TPlayWrapped, void>;

  public constructor({
    audioContext,
    mediaStreamDestination,
    soundDurationInMilliseconds = HALF_SECOND,
  }: {
    audioContext: AudioContext;
    mediaStreamDestination: MediaStreamAudioDestinationNode;
    soundDurationInMilliseconds?: number;
  }) {
    this.audioContext = audioContext;
    this.mediaStreamDestination = mediaStreamDestination;
    this.soundDurationInMilliseconds = soundDurationInMilliseconds;

    loggerTonalProcessor(
      'TonalProcessor constructor params { audioContext, mediaStreamDestination, soundDurationInMilliseconds }: %o',
      {
        stateAudioContext: audioContext.state,
        soundDurationInMilliseconds,
      },
    );

    this.cancellablePlayPromised = new CancelableRequest<TPlayWrapped, void>(this.playPromised, {
      afterCancelRequest: () => {
        this.cancelPlay();
      },
    });
  }

  public cancel() {
    loggerTonalProcessor('cancel');

    this.cancellablePlayPromised.cancelRequest();
  }

  public async playTone(tone: TTone): Promise<void> {
    loggerTonalProcessor('playTone');

    const playWrapped: TPlayWrapped = (onEnd) => {
      return playTone({
        tone,
        onEnd,
        audioContext: this.audioContext,
        destination: this.mediaStreamDestination,
        soundDurationInMilliseconds: this.soundDurationInMilliseconds,
      });
    };

    return this.cancellablePlayPromised.request(playWrapped);
  }

  private readonly playPromised = async (playWrapped: TPlayWrapped): Promise<void> => {
    return new Promise((resolve) => {
      const cancelPlay = playWrapped(resolve);

      this.cancelPlay = cancelPlay;
    });
  };

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  private cancelPlay: () => void = () => {};
}

export default TonalProcessor;
