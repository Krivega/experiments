import { canvasUtils } from '@experiments/utils';
import * as tensorflowBodySegmentation from '@tensorflow-models/body-segmentation';

import type { Segmentation } from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';

let offScreenCanvases: Record<string, OffscreenCanvas> = {};

export const resetOffScreenCanvases = () => {
  offScreenCanvases = {};
};

const ensureOffscreenCanvasCreated = (id: string, width: number, height: number) => {
  const key = `${id}_${width}_${height}`;

  if (!(key in offScreenCanvases)) {
    offScreenCanvases[key] = canvasUtils.createOffScreenCanvas(width, height);
  }

  return offScreenCanvases[key];
};

const renderImageDataToOffScreenCanvas = (image: ImageData, canvasName: string) => {
  const { width, height } = image;

  const canvas = ensureOffscreenCanvasCreated(canvasName, width, height);

  canvasUtils.renderImageDataToCanvas(image, canvas);

  return canvas;
};

export const createPersonMask = async (segmentation: Segmentation[], edgeBlurAmount: number) => {
  const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
  const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
  const drawContour = true;
  const foregroundThreshold = 0.6;

  const backgroundDarkeningMask = await tensorflowBodySegmentation.toBinaryMask(
    segmentation,
    foregroundColor,
    backgroundColor,
    drawContour,
    foregroundThreshold,
  );

  const backgroundMask = renderImageDataToOffScreenCanvas(backgroundDarkeningMask, 'mask');

  const { width, height } = backgroundMask;
  const canvas = ensureOffscreenCanvasCreated('blurredMask', width, height);

  canvasUtils.drawAndBlurImageOnOffScreenCanvas({
    canvas,
    image: backgroundMask,
    blurAmount: edgeBlurAmount,
  });

  return canvas.transferToImageBitmap();
};

export const imageBitmapToImageData = (imageBitmap: ImageBitmap, scale: number) => {
  const { width, height } = imageBitmap;
  const desiredWidth = width * scale;
  const desiredHeight = height * scale;

  const canvasSource = ensureOffscreenCanvasCreated('source', desiredWidth, desiredHeight);
  const imageData = canvasUtils.imageBitmapToImageData(
    canvasSource,
    imageBitmap,
    desiredWidth,
    desiredHeight,
  );

  return imageData;
};
