import getPathWithPublic from './getPathWithPublic';
import NoiseSuppressionEffect, { enableDebug } from './noiseSuppression';

enableDebug();

const workletUrl = getPathWithPublic(`@experiments/noise-suppression/noiseSuppressorWorklet.es.js`);

const noiseSuppressionEffect = new NoiseSuppressionEffect(workletUrl);

const processNoiseSuppressions = (audioTrack) => {
  noiseSuppressionEffect.stopEffect();

  return noiseSuppressionEffect.startEffect(audioTrack);
};

export const stopEffect = () => {
  noiseSuppressionEffect.stopEffect();
};

export default processNoiseSuppressions;
