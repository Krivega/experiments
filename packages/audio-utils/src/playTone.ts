import { SetTimeoutRequest } from '@experiments/timeout-requester';

import logger from './logger';
import resolvePlayFunction from './resolvePlayFunction';
import tones from './TonalProcessor/tones';

import type { TPlayFunction } from './resolvePlayFunction';
import type { TTone } from './typings';

const loggerPlayTone = logger.extend('playTone');

type TBufferOptions = {
  soundDurationInSeconds: number;
};

type TCreateBufferOptions = TBufferOptions & {
  volume?: number;
};

type TPlay = ({
  audioContext,
  buffer,
  destination,
  soundDurationInMilliseconds,
  onEnd,
}: {
  audioContext: AudioContext;
  buffer: AudioBuffer;
  destination: AudioNode;
  soundDurationInMilliseconds: number;
  onEnd?: () => void;
}) => () => void;

const TONE_VOLUME_DEFAULT = 1 as const;
const TONE_CHANNELS_COUNT = 1 as const;
const OUTPUT_CHANNEL_NUMBER = 0 as const;

const createBuffer = (
  audioContext: AudioContext,
  playFunction: TPlayFunction,
  options: TBufferOptions,
): AudioBuffer => {
  const { soundDurationInSeconds } = options;
  const { sampleRate } = audioContext;
  const duration = sampleRate * soundDurationInSeconds;
  const buffer = audioContext.createBuffer(TONE_CHANNELS_COUNT, duration, sampleRate);
  const output = buffer.getChannelData(OUTPUT_CHANNEL_NUMBER);

  for (let index = 0; index < output.length; index++) {
    const time = index / sampleRate;

    output[index] = playFunction(time, index, output[index]);
  }

  return buffer;
};

const createBufferByTone = (
  audioContext: AudioContext,
  tone: TTone,
  options: TCreateBufferOptions,
) => {
  const [toneStart, toneEnd] = tones[tone];
  const { volume } = options;
  const toneVolume = volume ?? TONE_VOLUME_DEFAULT;
  const playFunction = resolvePlayFunction({ toneStart, toneEnd, volume: toneVolume });

  return createBuffer(audioContext, playFunction, options);
};

const play: TPlay = ({ audioContext, buffer, destination, soundDurationInMilliseconds, onEnd }) => {
  loggerPlayTone('play');

  const bufferSource = audioContext.createBufferSource();

  bufferSource.connect(destination);
  bufferSource.buffer = buffer;

  bufferSource.start();

  const disconnect = () => {
    bufferSource.disconnect();
  };

  const setTimeoutRequest = new SetTimeoutRequest();

  setTimeoutRequest.request(() => {
    disconnect();

    if (onEnd) {
      onEnd();
    }
  }, soundDurationInMilliseconds);

  const cancel = () => {
    disconnect();

    setTimeoutRequest.cancelRequest();
  };

  return cancel;
};

const playTone = ({
  tone,
  volume,
  audioContext,
  soundDurationInMilliseconds,
  destination,
  onEnd,
}: {
  tone: TTone;
  audioContext: AudioContext;
  soundDurationInMilliseconds: number;
  destination: AudioNode;
  onEnd?: () => void;
  volume?: number;
}) => {
  const soundDurationInSeconds = soundDurationInMilliseconds / 1000;
  const toneBuffer = createBufferByTone(audioContext, tone, { soundDurationInSeconds, volume });

  loggerPlayTone('params {tone, volume, soundDurationInMilliseconds, stateAudioContext}: %o', {
    tone,
    volume,
    soundDurationInMilliseconds,
    stateAudioContext: audioContext.state,
  });

  return play({
    onEnd,
    audioContext,
    destination,
    buffer: toneBuffer,
    soundDurationInMilliseconds,
  });
};

export default playTone;
