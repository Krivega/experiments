import logger from '../logger';
import calcVolumeLevel from './calcVolumeLevel';
import initAnalyser from './initAnalyser';

const loggerResolveVolumeMediaStream = logger.extend('resolveVolumeMediaStream');

export type TVolumeMediaStream = {
  getVolume: () => number;
  resume: () => Promise<void>;
  destroy: () => Promise<void>;
};

const fftSize = 32;
const resolveVolumeMediaStream = (mediaStream: MediaStream): TVolumeMediaStream => {
  const { getDataArray, resume, destroy } = initAnalyser(mediaStream, fftSize);

  const getVolume = (): number => {
    const dataArray = getDataArray();

    const volume = calcVolumeLevel(dataArray);

    loggerResolveVolumeMediaStream('getVolume volume: ', volume);

    return volume;
  };

  return { getVolume, resume, destroy };
};

export default resolveVolumeMediaStream;
