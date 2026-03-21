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
    foregroundThreshold,
  );

  const { width, height } = backgroundDarkeningMask;
  const canvas = ensureOffscreenCanvasCreated('blurredMask', width, height);

  canvasUtils.renderImageDataToCanvas(backgroundDarkeningMask, canvas);

  return canvas.transferToImageBitmap();
};
