import * as tensorflowBodySegmentation from '@tensorflow-models/body-segmentation';
import type { Segmentation } from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';
import {
  createOffScreenCanvas,
  renderImageDataToCanvas,
  imageBitmapToImageData as _imageBitmapToImageData,
} from '../../../../utils/canvas';

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

export const createPersonMask = async (segmentation: Segmentation[], edgeBlurAmount) => {
  console.log('🚀 ~ file: render.ts ~ line 60 ~ createPersonMask ~ segmentation', segmentation);

  const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
  const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
  const drawContour = true;
  const foregroundThreshold = 0.6;

  const backgroundDarkeningMask = await tensorflowBodySegmentation.toBinaryMask(
    segmentation,
    foregroundColor,
    backgroundColor,
    drawContour,
    foregroundThreshold
  );

  const backgroundMask = renderImageDataToOffScreenCanvas(backgroundDarkeningMask, 'mask');

  const { width, height } = backgroundMask;
  const canvas = ensureOffscreenCanvasCreated('blurredMask', width, height);

  // drawAndBlurImageOnOffScreenCanvas({ canvas, image: backgroundMask, blurAmount: edgeBlurAmount });

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
