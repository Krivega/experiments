import loadImage from '../utils/loadImage';
import resolveProcessVideo from './resolveProcessVideo';
import mask360pSrc from './mask360p.jpg';
import mask720pSrc from './mask720p.jpg';
import mask1080pSrc from './mask1080p.jpg';

const processVideo = async (worker) => {
  const imageMask360p = await loadImage(mask360pSrc);
  const imageMask720p = await loadImage(mask720pSrc);
  const imageMask1080p = await loadImage(mask1080pSrc);
  const imageBitmapMask360p = await createImageBitmap(imageMask360p);
  const imageBitmapMask720p = await createImageBitmap(imageMask720p);
  const imageBitmapMask1080p = await createImageBitmap(imageMask1080p);

  return resolveProcessVideo({
    worker,
    imageBitmapMask360p,
    imageBitmapMask720p,
    imageBitmapMask1080p,
  });
};

export default processVideo;
