import DOM_URL from './domUrl';
import loadImage from './loadImage';

const getImageFromDataUrl = async (source: string): Promise<HTMLImageElement> => {
  return loadImage(source).then((image) => {
    if (!DOM_URL) {
      throw new Error('DOM_URL is required');
    }

    DOM_URL.revokeObjectURL(image.src);

    return image;
  });
};

export default getImageFromDataUrl;
