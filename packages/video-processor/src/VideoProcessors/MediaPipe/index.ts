/* eslint-disable unicorn/no-null */
import { canvasUtils, createFpsMeter, mediaStreamToVideo } from '@experiments/utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';

import startVideoProcessing from './startVideoProcessing';

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

const resolveProcessVideoMediaPipe: TResolveProcessVideo = async ({
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
    let videoSource: HTMLVideoElement | null = null;
    let canvasTarget: HTMLCanvasElement;

    const createVideo = async (mediaStream: MediaStream) => {
      return mediaStreamToVideo(mediaStream).then((video) => {
        videoSource = video;

        return videoSource;
      });
    };

    let state: {
      modelSelection: TModelSelection;
      edgeBlurAmount: number;
      isBlurBackground: boolean;
    } = {
      isBlurBackground: false,
      modelSelection: 'general',
      edgeBlurAmount: 4,
    };

    const getModelSelection = (): TModelSelection => {
      return state.modelSelection;
    };
    const getEdgeBlurAmount = (): number => {
      return state.edgeBlurAmount;
    };
    const getIsBlurBackground = (): boolean => {
      return state.isBlurBackground;
    };

    const updateState = (params: {
      modelSelection: TModelSelection;
      edgeBlurAmount: number;
      isBlurBackground: boolean;
    }) => {
      state = { ...state, ...params };
    };
    const updateOptionsSelfieSegmentation = () => {
      const GENERAL = 0;
      const LANDSCAPE = 1;

      selfieSegmentation.setOptions({
        modelSelection: getModelSelection() === 'general' ? GENERAL : LANDSCAPE,
      });
    };

    const changeParams = async (params: {
      modelSelection: TModelSelection;
      edgeBlurAmount: number;
      isBlurBackground: boolean;
    }) => {
      updateState(params);

      updateOptionsSelfieSegmentation();
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
      updateState({ modelSelection, edgeBlurAmount, isBlurBackground });
      updateOptionsSelfieSegmentation();

      return createVideo(mediaStream).then(async () => {
        if (!videoSource) {
          throw new Error('Video source not found');
        }

        const { width, height } = videoSource;

        canvasTarget = canvasUtils.createCanvas(width, height);

        return startVideoProcessing({
          selfieSegmentation,
          fpsMeter,
          getImageBitmapByWidth,
          canvasTarget,
          videoSource,
          getEdgeBlurAmount,
          getIsBlurBackground,
        }).then(() => {
          const mediaStreamOutput = canvasTarget.captureStream();

          return mediaStreamOutput;
        });
      });
    };
    const stopVideoProcessing = async (): Promise<void> => {
      fpsMeter.reset();

      return selfieSegmentation.close();
    };
    const stop = async () => {
      return stopVideoProcessing().then(() => {
        if (videoSource) {
          videoSource.srcObject = null;
        }
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
      return stop()
        .then(createSelfieSegmentation)
        .then((_selfieSegmentation) => {
          // eslint-disable-next-line no-param-reassign
          selfieSegmentation = _selfieSegmentation;
        })
        .then(async () => {
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
export default resolveProcessVideoMediaPipe;
