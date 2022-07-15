export const ID_360P = '360p';
export const ID_720P = '720p';
export const ID_1080P = '1080p';

export type TResolution = {
  id: string;
  label: string;
  aspectRatio: number;
  width: number;
  height: number;
};

export const resolution360p: TResolution = {
  id: ID_360P,
  label: '360p',
  width: 640,
  height: 360,
  aspectRatio: 16 / 9,
};
const resolution720p: TResolution = {
  id: ID_720P,
  label: '720p',
  width: 1280,
  height: 720,
  aspectRatio: 16 / 9,
};
const resolution1080p: TResolution = {
  id: ID_1080P,
  label: '1080p',
  width: 1920,
  height: 1080,
  aspectRatio: 16 / 9,
};
const resolutionsList: TResolution[] = [resolution360p, resolution720p, resolution1080p];

export default resolutionsList;
