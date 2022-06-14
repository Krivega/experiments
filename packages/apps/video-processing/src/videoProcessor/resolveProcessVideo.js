import AnimationRequest from 'request-animation-runner';
import { createCanvas, createOffScreenCanvas, imageToImageBitmap, drawImageMask } from './canvas';
import resolveWorkerAPI from './worker-api';
import mediaStreamToVideo from './mediaStreamToVideo';
import createFpsMeter from './createFpsMeter';

const resolveProcessVideo = async ({
  worker,
  imageBitmapMask360p,
  imageBitmapMask720p,
  imageBitmapMask1080p,
}) => {
  const workerAPI = resolveWorkerAPI(worker);
  const fpsMeter = createFpsMeter();
  const animationRequest = new AnimationRequest();
  let isActive = false;
  let requestIDBodySegmentationFrame;
  let videoSource;
  let canvasTarget;

  const createVideo = (mediaStream) => {
    return mediaStreamToVideo(mediaStream).then((video) => {
      videoSource = video;

      return videoSource;
    });
  };
  let isInProgressVideoProcessing = false;
  const checkEndProgressVideoProcessing = () => {
    return new Promise((resolve) => {
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
  const startVideoProcessing = () => {
    const { width, height } = videoSource;
    const canvasSource = createOffScreenCanvas(width, height);
    let imageBitmapMask;

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
    let personMask;

    fpsMeter.init();
    isActive = true;

    const bodySegmentationFrame = async () => {
      // Begin monitoring code for frames per second
      fpsMeter.begin();
      isInProgressVideoProcessing = true;

      if (isActive) {
        personMask = await workerAPI.processImage(imageBitmapSource, [imageBitmapSource]);
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
        imageMask: imageBitmapMask,
        canvas: canvasTarget,
        image: imageBitmapSource,
      });
    };

    bodySegmentationFrame().then(() => {
      animationRequest.activate();
      animationRequest.run(targetVideoFrame, 24);
    });
  };

  const start = ({
    mediaStream,
    algorithm,
    segmentationThreshold,
    edgeBlurAmount,
    multiPersonDecoding,
    architecture,
    outputStride,
    multiplier,
    quantBytes,
    internalResolution,
    scale,
  }) => {
    return workerAPI
      .init({
        algorithm,
        segmentationThreshold,
        edgeBlurAmount,
        multiPersonDecoding,
        architecture,
        outputStride,
        multiplier,
        quantBytes,
        internalResolution,
        scale,
      })
      .then(() => {
        return createVideo(mediaStream);
      })
      .then(() => {
        const { width, height } = videoSource;

        canvasTarget = createCanvas(width, height);

        startVideoProcessing();

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
    algorithm,
    multiPersonDecoding,
    edgeBlurAmount,
    internalResolution,
    segmentationThreshold,
    scale,
  }) => {
    return stopVideoProcessing()
      .then(() => {
        return workerAPI.changeParams({
          algorithm,
          segmentationThreshold,
          internalResolution,
          multiPersonDecoding,
          edgeBlurAmount,
          scale,
        });
      })
      .then(() => {
        return startVideoProcessing();
      });
  };
  const restart = ({
    mediaStream,
    algorithm,
    segmentationThreshold,
    edgeBlurAmount,
    multiPersonDecoding,
    architecture,
    outputStride,
    multiplier,
    quantBytes,
    internalResolution,
    scale,
  }) => {
    return stop().then(() => {
      return start({
        mediaStream,
        algorithm,
        segmentationThreshold,
        edgeBlurAmount,
        multiPersonDecoding,
        architecture,
        outputStride,
        multiplier,
        quantBytes,
        internalResolution,
        scale,
      });
    });
  };

  return { start, restart, changeParams, stop };
};

export default resolveProcessVideo;
