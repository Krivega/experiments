import NoiseSuppressionRnnoiseEffect, {
  enableDebug,
  NoiseSuppressionDtlnEffect,
} from '@experiments/noise-suppression';

import type { NoiseSuppressionRnnoiseEffectOptions } from '@experiments/noise-suppression';

enableDebug();

export type NoiseSuppressionAlgorithm = 'off' | 'rnnoise' | 'dtln';

const NOISE_SUPPRESSION_RNNOISE_WORKLET_URL =
  '@experiments/noise-suppression/noiseSuppressorWorkletRnnoise.js';
const NOISE_SUPPRESSION_DTLN_WORKLET_URL =
  '@experiments/noise-suppression/noiseSuppressorWorkletDtln.js';

let activeNoiseSuppressionEffect:
  | NoiseSuppressionRnnoiseEffect
  | NoiseSuppressionDtlnEffect
  | undefined;

const createNoiseSuppressionEffect = (
  algorithm: Exclude<NoiseSuppressionAlgorithm, 'off'>,
  options: NoiseSuppressionRnnoiseEffectOptions,
): NoiseSuppressionRnnoiseEffect | NoiseSuppressionDtlnEffect => {
  if (algorithm === 'rnnoise') {
    return new NoiseSuppressionRnnoiseEffect(NOISE_SUPPRESSION_RNNOISE_WORKLET_URL, options);
  }

  return new NoiseSuppressionDtlnEffect(NOISE_SUPPRESSION_DTLN_WORKLET_URL, options);
};

export const stopEffect = async () => {
  if (activeNoiseSuppressionEffect === undefined) {
    return;
  }

  const effect = activeNoiseSuppressionEffect;

  activeNoiseSuppressionEffect = undefined;

  await effect.stopEffect();
};

const processNoiseSuppressions = async (
  audioTrack: MediaStreamAudioTrack,
  algorithm: NoiseSuppressionAlgorithm,
  options: NoiseSuppressionRnnoiseEffectOptions = {},
) => {
  await stopEffect();

  if (algorithm === 'off') {
    return audioTrack;
  }

  const effect = createNoiseSuppressionEffect(algorithm, options);

  activeNoiseSuppressionEffect = effect;

  return effect.startEffect(audioTrack);
};

export default processNoiseSuppressions;
