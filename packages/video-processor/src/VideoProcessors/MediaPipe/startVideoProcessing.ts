import { Camera } from '@mediapipe/camera_utils';

import drawImageMask from './drawImageMask';

import type { SelfieSegmentation, ResultsListener } from '@mediapipe/selfie_segmentation';

const startVideoProcessing = async ({
  selfieSegmentation,
  fpsMeter,
  getImageBitmapByWidth,
  canvasTarget,
  videoSource,
  getEdgeBlurAmount,
  getIsBlurBackground,
}: {
  selfieSegmentation: SelfieSegmentation;
  fpsMeter: { begin: () => void; end: () => void };
  getImageBitmapByWidth: (width: number) => HTMLImageElement;
  canvasTarget: HTMLCanvasElement;
  videoSource: HTMLVideoElement;
  getEdgeBlurAmount: () => number;
  getIsBlurBackground: () => boolean;
}) => {
  const { width, height } = videoSource;
  const imageBitmapMask = getImageBitmapByWidth(width);

  const onResults: ResultsListener = (results) => {
    drawImageMask({
      edgeBlurAmount: getEdgeBlurAmount(),
      isBlurBackground: getIsBlurBackground(),
      personMask: results.segmentationMask as ImageBitmap,
      imageMask: imageBitmapMask,
      canvas: canvasTarget,
      videoSource: results.image as unknown as HTMLVideoElement,
    });
    fpsMeter.end();
  };

  selfieSegmentation.onResults(onResults);

  const camera = new Camera(videoSource, {
    onFrame: async () => {
      fpsMeter.begin();
      await selfieSegmentation.send({ image: videoSource });
    },
    width,
    height,
  });

  return camera.start();
};

export default startVideoProcessing;
