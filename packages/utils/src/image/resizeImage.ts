import { createCanvas, fill, renderImageToCanvas } from '../canvas';
import getImageSize from './getImageSize';

const resizeImage = (
  image: HTMLImageElement,
  {
    maxWidth,
    maxHeight,
    widthCapture,
    heightCapture,
    imageSmoothingQuality,
  }: {
    maxWidth: number;
    maxHeight: number;
    widthCapture?: number;
    heightCapture?: number;
    imageSmoothingQuality?: ImageSmoothingQuality;
  },
) => {
  const { width, height } = getImageSize({
    image,
    desiredWidth: maxWidth,
    desiredHeight: maxHeight,
  });

  const widthRender = widthCapture ?? width;
  const heightRender = heightCapture ?? height;
  const imageCoordinates = {
    x: (widthRender - width) / 2,
    y: (heightRender - height) / 2,
    width,
    height,
    imageSmoothingQuality,
  };

  const canvas = createCanvas(widthRender, heightRender);

  fill(canvas, { color: '#ffffff', width: widthRender, height: heightRender });
  fill(canvas, { color: '#202020', width: widthRender, height: heightRender });
  fill(canvas, { color: '#ffffff', ...imageCoordinates });

  renderImageToCanvas(image, canvas, imageCoordinates);

  return { dataURL: canvas.toDataURL(), width: widthRender, height: widthRender };
};

export default resizeImage;
