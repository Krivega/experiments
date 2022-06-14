import * as bodyPix from '@tensorflow-models/body-pix';
import {
  createOffScreenCanvas,
  renderImageDataToCanvas,
  drawAndBlurImageOnOffScreenCanvas,
  imageBitmapToImageData as _imageBitmapToImageData,
} from '../canvas';

let offScreenCanvases = {};

export const resetOffScreenCanvases = () => {
  offScreenCanvases = {};
};

const ensureOffscreenCanvasCreated = (id, width, height) => {
  const key = `${id}_${width}_${height}`;

  if (!offScreenCanvases[key]) {
    offScreenCanvases[key] = createOffScreenCanvas(width, height);
  }

  return offScreenCanvases[key];
};

const renderImageDataToOffScreenCanvas = (image, canvasName) => {
  const { width, height } = image;

  const canvas = ensureOffscreenCanvasCreated(canvasName, width, height);

  renderImageDataToCanvas(image, canvas);

  return canvas;
};

export const createPersonMask = (multiPersonSegmentation, edgeBlurAmount) => {
  const backgroundMaskImage = bodyPix.toMask(
    multiPersonSegmentation,
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 0, g: 0, b: 0, a: 0 }
  );

  const backgroundMask = renderImageDataToOffScreenCanvas(backgroundMaskImage, 'mask');

  const { width, height } = backgroundMask;
  const canvas = ensureOffscreenCanvasCreated('blurredMask', width, height);

  drawAndBlurImageOnOffScreenCanvas({ canvas, image: backgroundMask, blurAmount: edgeBlurAmount });

  return canvas.transferToImageBitmap();
};

export const imageBitmapToImageData = (imageBitmap, scale) => {
  const { width, height } = imageBitmap;
  const desiredWidth = width * scale;
  const desiredHeight = height * scale;

  const canvasSource = ensureOffscreenCanvasCreated('source', desiredWidth, desiredHeight);
  const imageData = _imageBitmapToImageData(canvasSource, imageBitmap, desiredWidth, desiredHeight);

  return imageData;
};
