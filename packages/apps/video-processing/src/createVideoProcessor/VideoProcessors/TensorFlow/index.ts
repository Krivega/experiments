import AnimationRequest from 'request-animation-runner';
import createFpsMeter from '@vinteo/utils/src/createFpsMeter';
import mediaStreamToVideo from '@vinteo/utils/src/mediaStreamToVideo';
import { createCanvas, createOffScreenCanvas, imageToImageBitmap } from '@vinteo/utils/src/canvas';
import type { TResolveProcessVideo, TModelSelection } from '../../../typings';
import drawImageMask from './drawImageMask';
import runtime from './runtime';

const resolveProcessVideoTensorFlow: TResolveProcessVideo = ({
  imageBitmapMask360p,
  imageBitmapMask720p,
  imageBitmapMask1080p,
}) => {
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
  const startVideoProcessing = ({ edgeBlurAmount }: { edgeBlurAmount: number }) => {
    const { width, height } = videoSource;
    const canvasSource = createOffScreenCanvas(width, height);
    let imageBitmapMask: HTMLImageElement;

    // eslint-disable-next-line default-case
    switch (width) {
      case 640:
        imageBitmapMask = imageBitmapMask360p;
        break;
      case 1280:
        imageBitmapMask = imageBitmapMask720p;
        break;
      case 1920:
        imageBitmapMask = imageBitmapMask1080p;
        break;
    }

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
  }: {
    mediaStream: MediaStream;
    modelSelection: TModelSelection;
    edgeBlurAmount: number;
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

        startVideoProcessing({ edgeBlurAmount });

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
  }: {
    modelSelection: TModelSelection;
    edgeBlurAmount: number;
  }) => {
    return stopVideoProcessing()
      .then(() => {
        return runtime.changeParams({
          modelSelection,
        });
      })
      .then(() => {
        return startVideoProcessing({ edgeBlurAmount });
      });
  };
  const restart = ({
    mediaStream,
    modelSelection,
    edgeBlurAmount,
  }: {
    mediaStream: MediaStream;
    modelSelection: TModelSelection;
    edgeBlurAmount: number;
  }) => {
    return stop().then(() => {
      return start({
        mediaStream,
        modelSelection,
        edgeBlurAmount,
      });
    });
  };

  return { start, restart, changeParams, stop };
};

export default resolveProcessVideoTensorFlow;
