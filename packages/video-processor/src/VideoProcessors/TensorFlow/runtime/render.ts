import * as tensorflowBodySegmentation from '@tensorflow-models/body-segmentation';
import type { Segmentation } from '@tensorflow-models/body-segmentation/dist/shared/calculators/interfaces/common_interfaces';
import { renderImageDataToCanvas, createOffScreenCanvas } from '@vinteo/utils/src/canvas';

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

export const createPersonMask = async (segmentation: Segmentation[]) => {
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

  const { width, height } = backgroundDarkeningMask;
  const canvas = ensureOffscreenCanvasCreated('blurredMask', width, height);

  renderImageDataToCanvas(backgroundDarkeningMask, canvas);

  return canvas.transferToImageBitmap();
};
