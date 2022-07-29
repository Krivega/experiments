export type TModelSelection = 'general' | 'landscape';
export type TArchitecture = 'MediaPipe' | 'MediaPipeOptimized' | 'MediaPipeWorker' | 'TensorFlow';

type TParams = {
  mediaStream: MediaStream;
  modelSelection: TModelSelection;
  edgeBlurAmount: number;
  isBlurBackground: boolean;
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
}) => Promise<TProcessVideo>;
