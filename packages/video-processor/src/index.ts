import { imageUtils } from '@experiments/utils';

import mask1080pSource from './mask1080p.jpg';
import mask360pSource from './mask360p.jpg';
import mask720pSource from './mask720p.jpg';

import type { TProcessVideo, TResolveProcessVideo, TArchitecture } from './typings';

const loadVideoProcessor = async (architecture: TArchitecture): Promise<TResolveProcessVideo> => {
  let resolveProcessVideo;

  switch (architecture) {
    case 'MediaPipe': {
      resolveProcessVideo = await import('./VideoProcessors/MediaPipe');
      break;
    }
    case 'MediaPipeOptimized': {
      resolveProcessVideo = await import('./VideoProcessors/MediaPipeOptimized');
      break;
    }
    case 'MediaPipeWorker': {
      resolveProcessVideo = await import('./VideoProcessors/MediaPipe');
      break;
    }
    case 'TensorFlow': {
      resolveProcessVideo = await import('./VideoProcessors/TensorFlow');
      break;
    }
    default: {
      throw new Error('Unknown architecture');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return resolveProcessVideo.default;
};

const createVideoProcessor = async (architecture: TArchitecture): Promise<TProcessVideo> => {
  const imageMask360p = await imageUtils.loadImage(mask360pSource);
  const imageMask720p = await imageUtils.loadImage(mask720pSource);
  const imageMask1080p = await imageUtils.loadImage(mask1080pSource);

  const resolveProcessVideo = await loadVideoProcessor(architecture);

  return resolveProcessVideo({
    imageBitmapMask360p: imageMask360p,
    imageBitmapMask720p: imageMask720p,
    imageBitmapMask1080p: imageMask1080p,
  });
};

export default createVideoProcessor;
