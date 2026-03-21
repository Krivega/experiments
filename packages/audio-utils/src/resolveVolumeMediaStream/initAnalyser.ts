/* eslint-disable unicorn/no-null */
import createAudioContext from '../createAudioContext';
import logger from '../logger';

import type { TAnalyser } from '../typings';

const loggerInitAnalyser = logger.extend('initAnalyser');

const initAnalyser = (mediaStream: MediaStream, fftSize?: number): TAnalyser => {
  let audioContext: AudioContext | null = createAudioContext();
  const mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
  let analyser: AnalyserNode | null = audioContext.createAnalyser();

  mediaStreamSource.connect(analyser);

  if (fftSize !== undefined && fftSize !== 0) {
    analyser.fftSize = fftSize;
  }

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const getDataArray = (): Uint8Array => {
    analyser?.getByteFrequencyData(dataArray);

    return dataArray;
  };

  const resume = async (): Promise<void> => {
    loggerInitAnalyser('resume audioContext: %o', { stateAudioContext: audioContext?.state });

    return audioContext ? audioContext.resume() : Promise.resolve();
  };

  const destroy = async (): Promise<void> => {
    return audioContext
      ? audioContext.close().finally(() => {
          audioContext = null;
          analyser = null;
        })
      : Promise.resolve();
  };

  return { getDataArray, resume, destroy };
};

export default initAnalyser;
