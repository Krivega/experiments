/* eslint-disable unicorn/no-null */
import {
  canvasUtils,
  createFpsMeter,
  createFPSCounter,
  mediaStreamToVideo,
} from '@experiments/utils';
import { Camera } from '@mediapipe/camera_utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import AnimationRequest from 'request-animation-runner';

import drawImageMask from '../MediaPipe/drawImageMask';

import type { ResultsListener } from '@mediapipe/selfie_segmentation';
import type { TModelSelection, TResolveProcessVideo } from '../../typings';

const createSelfieSegmentation = async (): Promise<SelfieSegmentation> => {
  const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
  });

  return selfieSegmentation.initialize().then(() => {
    return selfieSegmentation;
  });
};

const resolveProcessVideoMediaPipeOptimized: TResolveProcessVideo = async ({
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

  return createSelfieSegmentation().then((selfieSegmentation) => {
    const fpsMeter = createFpsMeter();
    const fpsCounter = createFPSCounter();
    const animationRequest = new AnimationRequest();
    let videoSource: HTMLVideoElement | null = null;
    let canvasTarget: HTMLCanvasElement;

    const createVideo = async (mediaStream: MediaStream) => {
      return mediaStreamToVideo(mediaStream).then((video) => {
        videoSource = video;

        return videoSource;
      });
    };
    // const isInProgressVideoProcessing = false;
    const checkEndProgressVideoProcessing = async () => {
      return new Promise<void>((resolve) => {
        const check = () => {
          // if (isInProgressVideoProcessing) {
          //   setTimeout(check, 100);
          // } else {
          //   resolve();
          // }
          resolve();
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
      if (!videoSource) {
        throw new Error('Video source not found');
      }

      const { width, height } = videoSource;

      const imageBitmapMask = getImageBitmapByWidth(width);

      let personMask: ImageBitmap | undefined;

      const targetVideoFrame = () => {
        if (!videoSource) {
          throw new Error('Video source not found');
        }

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
          if (!videoSource) {
            throw new Error('Video source not found');
          }

          fpsMeter.begin();
          await selfieSegmentation.send({ image: videoSource });
        },
        width,
        height,
      });

      camera.start().catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });

      animationRequest.activate();
      animationRequest.run(() => {
        if (fpsCounter.value < 60 && personMask) {
          // targetVideoFrame();
        }
      }, 60);
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
      return createVideo(mediaStream).then(() => {
        if (!videoSource) {
          throw new Error('Video source not found');
        }

        const { width, height } = videoSource;

        canvasTarget = canvasUtils.createCanvas(width, height);

        startVideoProcessing({ modelSelection, edgeBlurAmount, isBlurBackground });

        const mediaStreamOutput = canvasTarget.captureStream();

        return mediaStreamOutput;
      });
    };
    const stopVideoProcessing = async () => {
      animationRequest.deactivate();
      fpsMeter.reset();

      return checkEndProgressVideoProcessing();

      // return selfieSegmentation.close().then(checkEndProgressVideoProcessing);
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
        .then(() => {})
        .then(() => {
          startVideoProcessing({ modelSelection, edgeBlurAmount, isBlurBackground });
        });
    };
    const restart = async ({
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
  });
};
export default resolveProcessVideoMediaPipeOptimized;
