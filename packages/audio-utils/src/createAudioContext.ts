import AudioContext from './AudioContext';
import logger from './logger';

const loggerCreateAudioContext = logger.extend('createAudioContext');

const createAudioContext = () => {
  loggerCreateAudioContext('createAudioContext');

  return new AudioContext();
};

export default createAudioContext;
