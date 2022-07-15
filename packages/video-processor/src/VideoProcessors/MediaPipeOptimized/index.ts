import AnimationRequest from 'request-animation-runner';
import { Camera } from '@mediapipe/camera_utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import type { ResultsListener } from '@mediapipe/selfie_segmentation';
import createFpsMeter from '@vinteo/utils/src/createFpsMeter';
import createFPSCounter from '@vinteo/utils/src/createFPSCounter';
import mediaStreamToVideo from '@vinteo/utils/src/mediaStreamToVideo';
import { createCanvas } from '@vinteo/utils/src/canvas';
import type { TResolveProcessVideo, TModelSelection } from '../../typings';
import drawImageMask from '../MediaPipe/drawImageMask';

const resolveProcessVideoMediaPipeOptimized: TResolveProcessVideo = ({
  imageBitmapMask360p,
  imageBitmapMask720p,
  imageBitmapMask1080p,
}) => {
  const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
  });
  const fpsMeter = createFpsMeter();
  const fpsCounter = createFPSCounter();
  const animationRequest = new AnimationRequest();
  let videoSource: HTMLVideoElement;
  let canvasTarget: HTMLCanvasElement;

  const createVideo = (mediaStream: MediaStream) => {
    return mediaStreamToVideo(mediaStream).then((video) => {
      videoSource = video;

      return videoSource;
    });
  };
  const isInProgressVideoProcessing = false;
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
    modelSelection,
    edgeBlurAmount,
  }: {
    modelSelection: TModelSelection;
    edgeBlurAmount: number;
  }) => {
    const { width, height } = videoSource;

    let imageBitmapMask: HTMLImageElement;

    fpsMeter.init();

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

    let personMask: ImageBitmap | undefined;

    const targetVideoFrame = () => {
      drawImageMask({
        edgeBlurAmount,
        personMask,
        videoSource,
        imageMask: imageBitmapMask,
        canvas: canvasTarget,
      });
      fpsMeter.end();
      fpsCounter.tick();
    };

    const onResults: ResultsListener = (results) => {
      personMask = results.segmentationMask as ImageBitmap;
      targetVideoFrame();
    };

    const GENERAL = 0;
    const LANDSCAPE = 1;

    selfieSegmentation.setOptions({
      modelSelection: modelSelection === 'general' ? GENERAL : LANDSCAPE,
    });
    selfieSegmentation.onResults(onResults);

    const camera = new Camera(videoSource, {
      onFrame: async () => {
        fpsMeter.begin();
        await selfieSegmentation.send({ image: videoSource });
      },
      width,
      height,
    });

    camera.start();

    animationRequest.activate();
    animationRequest.run(() => {
      if (fpsCounter.value < 60 && personMask) {
        // targetVideoFrame();
        console.log(
          '🚀 ~ file: index.ts ~ line 117 ~ animationRequest.run ~ targetVideoFrame',
          fpsCounter.value
        );
      }
    }, 60);
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
    return createVideo(mediaStream).then(() => {
      const { width, height } = videoSource;

      canvasTarget = createCanvas(width, height);

      startVideoProcessing({ modelSelection, edgeBlurAmount });

      const mediaStreamOutput = canvasTarget.captureStream();

      return mediaStreamOutput;
    });
  };
  const stopVideoProcessing = () => {
    animationRequest.deactivate();
    fpsMeter.reset();

    return checkEndProgressVideoProcessing();

    // return selfieSegmentation.close().then(checkEndProgressVideoProcessing);
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
      .then(() => {})
      .then(() => {
        return startVideoProcessing({ modelSelection, edgeBlurAmount });
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
export default resolveProcessVideoMediaPipeOptimized;
