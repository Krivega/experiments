import { Camera } from '@mediapipe/camera_utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import type { ResultsListener } from '@mediapipe/selfie_segmentation';
import drawImageMask from './drawImageMask';

const startVideoProcessing = ({
  selfieSegmentation,
  fpsMeter,
  getImageBitmapByWidth,
  canvasTarget,
  videoSource,
  getEdgeBlurAmount,
  getIsBlurBackground,
}: {
  selfieSegmentation: SelfieSegmentation;
  fpsMeter: { init: () => void; begin: () => void; end: () => void };
  getImageBitmapByWidth: (width: number) => HTMLImageElement;
  canvasTarget: HTMLCanvasElement;
  videoSource: HTMLVideoElement;
  getEdgeBlurAmount: () => number;
  getIsBlurBackground: () => boolean;
}) => {
  const { width, height } = videoSource;
  const imageBitmapMask = getImageBitmapByWidth(width);

  fpsMeter.init();

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
