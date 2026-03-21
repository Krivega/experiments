/* eslint-disable unicorn/no-null */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { canvasUtils, createFpsMeter, mediaStreamToVideo } from '@experiments/utils';
import AnimationRequest from 'request-animation-runner';

import drawImageMask from './drawImageMask';
import runtime from './runtime';

import type { TModelSelection, TResolveProcessVideo } from '../../typings';

const resolveProcessVideoTensorFlow: TResolveProcessVideo = async ({
  imageBitmapMask360p,
  imageBitmapMask720p,
  imageBitmapMask1080p,
}) => {
  const getImageBitmapByWidth = (width: number): HTMLImageElement => {
    // eslint-disable-next-line default-case
    switch (width) {
      case 640: {
        return imageBitmapMask360p;
      }
      case 1280: {
        return imageBitmapMask720p;
      }
    }

    return imageBitmapMask1080p;
  };

  const fpsMeter = createFpsMeter();
  const animationRequest = new AnimationRequest();
  let isActive = false;
  let requestIDBodySegmentationFrame: number;
  let videoSource: HTMLVideoElement | null = null;
  let canvasTarget: HTMLCanvasElement;

  const createVideo = async (mediaStream: MediaStream) => {
    return mediaStreamToVideo(mediaStream).then((video) => {
      videoSource = video;

      return videoSource;
    });
  };
  let isInProgressVideoProcessing = false;
  const checkEndProgressVideoProcessing = async () => {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (isInProgressVideoProcessing) {
          setTimeout(check, 100);
        } else {
          resolve();
        }
      };

      check();
    });
  };
  const startVideoProcessing = ({
    edgeBlurAmount,
  }: {
    edgeBlurAmount: number;
    isBlurBackground: boolean;
  }) => {
    if (!videoSource) {
      throw new Error('Video source not found');
    }

    const { width, height } = videoSource;
    const canvasSource = canvasUtils.createOffScreenCanvas(width, height);
    const imageBitmapMask = getImageBitmapByWidth(width);

    let imageBitmapSource = canvasUtils.imageToImageBitmap({
      image: videoSource,
      canvas: canvasSource,
    });
    let personMask: ImageBitmap | undefined;

    isActive = true;

    const bodySegmentationFrame = async () => {
      // Begin monitoring code for frames per second
      fpsMeter.begin();
      isInProgressVideoProcessing = true;

      if (isActive) {
        personMask = await runtime.processVideo(imageBitmapSource);
      }

      // End monitoring code for frames per second
      fpsMeter.end();

      isInProgressVideoProcessing = false;

      // for check after async
      if (isActive) {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        requestIDBodySegmentationFrame = requestAnimationFrame(bodySegmentationFrame);
      }
    };

    const targetVideoFrame = () => {
      if (!videoSource) {
        throw new Error('Video source not found');
      }

      imageBitmapSource = canvasUtils.imageToImageBitmap({
        image: videoSource,
        canvas: canvasSource,
      });

      drawImageMask({
        personMask,
        edgeBlurAmount,
        videoSource,
        imageMask: imageBitmapMask,
        canvas: canvasTarget,
      });
    };

    bodySegmentationFrame().then(() => {
      animationRequest.activate();
      animationRequest.run(targetVideoFrame, 24);
    });
  };

  const start = async ({
    mediaStream,
    modelSelection,
    edgeBlurAmount,
    isBlurBackground,
  }: {
    mediaStream: MediaStream;
    modelSelection: TModelSelection;
    edgeBlurAmount: number;
    isBlurBackground: boolean;
  }) => {
    return runtime
      .init({
        modelSelection,
      })
      .then(async () => {
        return createVideo(mediaStream);
      })
      .then(() => {
        if (!videoSource) {
          throw new Error('Video source not found');
        }

        const { width, height } = videoSource;

        canvasTarget = canvasUtils.createCanvas(width, height);

        startVideoProcessing({ edgeBlurAmount, isBlurBackground });

        const mediaStreamOutput = canvasTarget.captureStream();

        return mediaStreamOutput;
      });
  };
  const stopVideoProcessing = async () => {
    isActive = false;
    window.cancelAnimationFrame(requestIDBodySegmentationFrame);
    animationRequest.deactivate();
    fpsMeter.reset();

    return checkEndProgressVideoProcessing();
  };
  const stop = async () => {
    return stopVideoProcessing().then(() => {
      if (videoSource) {
        videoSource.srcObject = null;
      }
    });
  };

  const changeParams = async ({
    modelSelection,
    edgeBlurAmount,
    isBlurBackground,
  }: {
    modelSelection: TModelSelection;
    edgeBlurAmount: number;
    isBlurBackground: boolean;
  }) => {
    return stopVideoProcessing()
      .then(async () => {
        return runtime.changeParams({
          modelSelection,
        });
      })
      .then(() => {
        startVideoProcessing({ edgeBlurAmount, isBlurBackground });
      });
  };
  const restart = async ({
    mediaStream,
    modelSelection,
    isBlurBackground,
    edgeBlurAmount,
  }: {
    mediaStream: MediaStream;
    modelSelection: TModelSelection;
    edgeBlurAmount: number;
    isBlurBackground: boolean;
  }) => {
    return stop().then(async () => {
      return start({
        mediaStream,
        modelSelection,
        edgeBlurAmount,
        isBlurBackground,
      });
    });
  };

  return { start, restart, changeParams, stop };
};

export default resolveProcessVideoTensorFlow;
