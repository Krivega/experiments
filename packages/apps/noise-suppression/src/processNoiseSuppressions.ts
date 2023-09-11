import NoiseSuppressionEffect, { enableDebug } from './noiseSuppression';

enableDebug();

const workletUrl = `/@vinteo/noise-suppression/noiseSuppressorWorklet.es.js`;

const noiseSuppressionEffect = new NoiseSuppressionEffect(workletUrl);

const processNoiseSuppressions = (audioTrack) => {
  noiseSuppressionEffect.stopEffect();

  return noiseSuppressionEffect.startEffect(audioTrack);
};

export const stopEffect = () => {
  noiseSuppressionEffect.stopEffect();
};

export default processNoiseSuppressions;
