import { resolution720p } from '@experiments/system-devices';

export type TState = {
  resolutionId: string;
  videoDeviceId: string;
  audioInputDeviceId: string;
  edgeBlurAmount: number;
};

const defaultState: TState = {
  resolutionId: resolution720p.id,
  videoDeviceId: '',
  audioInputDeviceId: '',
  edgeBlurAmount: 4,
};

export default defaultState;
