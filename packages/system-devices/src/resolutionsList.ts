import { ID_1080P, ID_360P, ID_4K, ID_720P, ID_AUTO, ID_CIF } from './constants';

const resolutionAuto = {
  id: ID_AUTO,
  width: 1280,
  height: 720,
  aspectRatio: 16 / 9,
};
const resolutionCIF = {
  id: ID_CIF,
  width: 352,
  height: 288,
  aspectRatio: 4 / 3,
};
export const resolution360p = {
  id: ID_360P,
  width: 640,
  height: 360,
  aspectRatio: 16 / 9,
};
export const resolution720p = {
  id: ID_720P,
  width: 1280,
  height: 720,
  aspectRatio: 16 / 9,
};
const resolution1080p = {
  id: ID_1080P,
  width: 1920,
  height: 1080,
  aspectRatio: 16 / 9,
};
const resolution4k = {
  id: ID_4K,
  width: 4096,
  height: 2160,
  aspectRatio: 16 / 9,
};

const resolutionsList = [
  resolutionAuto,
  resolutionCIF,
  resolution360p,
  resolution720p,
  resolution1080p,
  resolution4k,
];

export type TIdResolution = string;

export const hasAutoResolution = (resolution?: { id?: string }) => {
  return resolution?.id === ID_AUTO;
};

export default resolutionsList;
