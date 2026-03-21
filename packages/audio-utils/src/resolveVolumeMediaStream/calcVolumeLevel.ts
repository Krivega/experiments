import { resolvers } from '@experiments/utils';

const clamp100 = resolvers.clampResolve(0, 100);

const calcVolumeLevel = (dataArray: Uint8Array): number => {
  const sum = dataArray.reduce((accumulator, value) => {
    return accumulator + value;
  }, 0);
  const volumeLevel = clamp100(sum / dataArray.length);

  return volumeLevel;
};

export default calcVolumeLevel;
