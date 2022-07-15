import loadImage from '@experiments/utils/src/loadImage';
import type { TProcessVideo, TResolveProcessVideo, TArchitecture } from './typings';
import mask360pSrc from './mask360p.jpg';
import mask720pSrc from './mask720p.jpg';
import mask1080pSrc from './mask1080p.jpg';

const loadVideoProcessor = async (architecture: TArchitecture): Promise<TResolveProcessVideo> => {
  let resolveProcessVideo;

  switch (architecture) {
    case 'MediaPipe':
      resolveProcessVideo = await import('./VideoProcessors/MediaPipe');
      break;
    case 'MediaPipeOptimized':
      resolveProcessVideo = await import('./VideoProcessors/MediaPipeOptimized');
      break;
    case 'MediaPipeWorker':
      resolveProcessVideo = await import('./VideoProcessors/MediaPipe');
      break;
    case 'TensorFlow':
      resolveProcessVideo = await import('./VideoProcessors/TensorFlow');
      break;
    default:
      throw new Error('Unknown architecture');
  }

  return resolveProcessVideo.default;
};

const createVideoProcessor = async (architecture: TArchitecture): Promise<TProcessVideo> => {
  const imageMask360p = await loadImage(mask360pSrc);
  const imageMask720p = await loadImage(mask720pSrc);
  const imageMask1080p = await loadImage(mask1080pSrc);

  const resolveProcessVideo = await loadVideoProcessor(architecture);

  return resolveProcessVideo({
    imageBitmapMask360p: imageMask360p,
    imageBitmapMask720p: imageMask720p,
    imageBitmapMask1080p: imageMask1080p,
  });
};

export default createVideoProcessor;
