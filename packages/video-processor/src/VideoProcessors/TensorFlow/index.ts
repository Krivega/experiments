import {
  createCanvas,
  createOffScreenCanvas,
  imageToImageBitmap,
} from '@experiments/utils/src/canvas';
import createFpsMeter from '@experiments/utils/src/createFpsMeter';
import mediaStreamToVideo from '@experiments/utils/src/mediaStreamToVideo';
import AnimationRequest from 'request-animation-runner';
import type { TModelSelection, TResolveProcessVideo } from '../../typings';
import drawImageMask from './drawImageMask';
import runtime from './runtime';

const resolveProcessVideoTensorFlow: TResolveProcessVideo = ({
  imageBitmapMask360p,
  imageBitmapMask720p,
  imageBitmapMask1080p,
}) => {
  const getImageBitmapByWidth = (width: number): HTMLImageElement => {
    // eslint-disable-next-line default-case
    switch (width) {
      case 640:
        return imageBitmapMask360p;
      case 1280:
        return imageBitmapMask720p;
    }

    return imageBitmapMask1080p;
  };

  const fpsMeter = createFpsMeter();
  const animationRequest = new AnimationRequest();
  let isActive = false;
  let requestIDBodySegmentationFrame: number;
  let videoSource: HTMLVideoElement;
  let canvasTarget: HTMLCanvasElement;

  const createVideo = (mediaStream: MediaStream) => {
    return mediaStreamToVideo(mediaStream).then((video) => {
      videoSource = video;

      return videoSource;
    });
  };
  let isInProgressVideoProcessing = false;
  const checkEndProgressVideoProcessing = () => {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (isInProgressVideoProcessing === false) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  };
  const startVideoProcessing = ({
    edgeBlurAmount,
    isBlurBackground,
  }: {
    edgeBlurAmount: number;
    isBlurBackground: boolean;
  }) => {
    const { width, height } = videoSource;
    const canvasSource = createOffScreenCanvas(width, height);
    const imageBitmapMask = getImageBitmapByWidth(width);

    let imageBitmapSource = imageToImageBitmap({ image: videoSource, canvas: canvasSource });
    let personMask: ImageBitmap;

    fpsMeter.init();
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
        requestIDBodySegmentationFrame = requestAnimationFrame(bodySegmentationFrame);
      }
    };

    const targetVideoFrame = () => {
      imageBitmapSource = imageToImageBitmap({ image: videoSource, canvas: canvasSource });

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

  const start = ({
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
      .then(() => {
        return createVideo(mediaStream);
      })
      .then(() => {
        const { width, height } = videoSource;

        canvasTarget = createCanvas(width, height);

        startVideoProcessing({ edgeBlurAmount, isBlurBackground });

        const mediaStreamOutput = canvasTarget.captureStream();

        return mediaStreamOutput;
      });
  };
  const stopVideoProcessing = () => {
    isActive = false;
    window.cancelAnimationFrame(requestIDBodySegmentationFrame);
    animationRequest.deactivate();
    fpsMeter.reset();

    return checkEndProgressVideoProcessing();
  };
  const stop = () => {
    return stopVideoProcessing().then(() => {
      if (videoSource) {
        videoSource.srcObject = null;
      }
    });
  };

  const changeParams = ({
    modelSelection,
    edgeBlurAmount,
    isBlurBackground,
  }: {
    modelSelection: TModelSelection;
    edgeBlurAmount: number;
    isBlurBackground: boolean;
  }) => {
    return stopVideoProcessing()
      .then(() => {
        return runtime.changeParams({
          modelSelection,
        });
      })
      .then(() => {
        return startVideoProcessing({ edgeBlurAmount, isBlurBackground });
      });
  };
  const restart = ({
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
    return stop().then(() => {
      return start({
        mediaStream,
        modelSelection,
        edgeBlurAmount,
        isBlurBackground,
      });
    });
  };

  return Promise.resolve({ start, restart, changeParams, stop });
};

export default resolveProcessVideoTensorFlow;
