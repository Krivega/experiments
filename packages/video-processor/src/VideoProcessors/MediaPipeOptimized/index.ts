import AnimationRequest from 'request-animation-runner';
import { Camera } from '@mediapipe/camera_utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import type { ResultsListener } from '@mediapipe/selfie_segmentation';
import createFpsMeter from '@experiments/utils/src/createFpsMeter';
import createFPSCounter from '@experiments/utils/src/createFPSCounter';
import mediaStreamToVideo from '@experiments/utils/src/mediaStreamToVideo';
import { createCanvas } from '@experiments/utils/src/canvas';
import type { TResolveProcessVideo, TModelSelection } from '../../typings';
import drawImageMask from '../MediaPipe/drawImageMask';

const createSelfieSegmentation = (): Promise<SelfieSegmentation> => {
  const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
  });

  return selfieSegmentation.initialize().then(() => {
    return selfieSegmentation;
  });
};

const resolveProcessVideoMediaPipeOptimized: TResolveProcessVideo = ({
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

  return createSelfieSegmentation().then((selfieSegmentation) => {
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
      isBlurBackground,
    }: {
      modelSelection: TModelSelection;
      edgeBlurAmount: number;
      isBlurBackground: boolean;
    }) => {
      const { width, height } = videoSource;

      const imageBitmapMask = getImageBitmapByWidth(width);

      fpsMeter.init();

      let personMask: ImageBitmap | undefined;

      const targetVideoFrame = () => {
        drawImageMask({
          edgeBlurAmount,
          personMask,
          videoSource,
          isBlurBackground,
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
      isBlurBackground,
    }: {
      mediaStream: MediaStream;
      modelSelection: TModelSelection;
      edgeBlurAmount: number;
      isBlurBackground: boolean;
    }) => {
      return createVideo(mediaStream).then(() => {
        const { width, height } = videoSource;

        canvasTarget = createCanvas(width, height);

        startVideoProcessing({ modelSelection, edgeBlurAmount, isBlurBackground });

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
      isBlurBackground,
    }: {
      modelSelection: TModelSelection;
      edgeBlurAmount: number;
      isBlurBackground: boolean;
    }) => {
      return stopVideoProcessing()
        .then(() => {})
        .then(() => {
          return startVideoProcessing({ modelSelection, edgeBlurAmount, isBlurBackground });
        });
    };
    const restart = ({
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
      return stop().then(() => {
        return start({
          mediaStream,
          modelSelection,
          edgeBlurAmount,
          isBlurBackground,
        });
      });
    };

    return { start, restart, changeParams, stop };
  });
};
export default resolveProcessVideoMediaPipeOptimized;
