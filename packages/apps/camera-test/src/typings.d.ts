export type TModelSelection = 'general' | 'landscape';
export type TArchitecture = 'MediaPipe' | 'MediaPipeOptimized' | 'MediaPipeWorker' | 'TensorFlow';

type TParams = {
  mediaStream: MediaStream;
  modelSelection: TModelSelection;
  edgeBlurAmount: number;
};

export type TProcessVideo = {
  start: (params: TParams) => Promise<MediaStream>;
  restart: (params: TParams) => Promise<MediaStream>;
  changeParams: (params: Omit<TParams, 'mediaStream'>) => Promise<void>;
  stop: () => Promise<void>;
};

export type TResolveProcessVideo = (params: {
  imageBitmapMask360p: HTMLImageElement;
  imageBitmapMask720p: HTMLImageElement;
  imageBitmapMask1080p: HTMLImageElement;
}) => TProcessVideo;

export type TVideoConstraints = {
  torch?: boolean | { exact?: boolean; ideal?: boolean };
  whiteBalanceMode?: 'none' | 'manual' | 'single-shot' | 'continuous';
  exposureMode?: 'none' | 'manual' | 'single-shot' | 'continuous';
  pointsOfInterest?: { x: number; y: number };
  exposureCompensation?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  colorTemperature?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  iso?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  contrast?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  brightness?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  saturation?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  sharpness?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  focusDistance?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  zoom?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  pan?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  tilt?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  width?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  height?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  aspectRatio?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  frameRate?: number | { min?: number; max?: number; exact?: number; ideal?: number };
  facingMode?: string | { exact: string; ideal: string };
  resizeMode?: 'none' | 'crop-and-scale';
};
