import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import createFpsMeter from '@experiments/utils/src/createFpsMeter';
import mediaStreamToVideo from '@experiments/utils/src/mediaStreamToVideo';
import { createCanvas } from '@experiments/utils/src/canvas';
import type { TResolveProcessVideo, TModelSelection } from '../../typings';
import startVideoProcessing from './startVideoProcessing';

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

const resolveProcessVideoMediaPipe: TResolveProcessVideo = ({
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
    let videoSource: HTMLVideoElement;
    let canvasTarget: HTMLCanvasElement;

    const createVideo = (mediaStream: MediaStream) => {
      return mediaStreamToVideo(mediaStream).then((video) => {
        videoSource = video;

        return videoSource;
      });
    };

    let state: {
      modelSelection: TModelSelection;
      edgeBlurAmount: number;
    } = {
      modelSelection: 'general',
      edgeBlurAmount: 4,
    };

    const getModelSelection = (): TModelSelection => {
      return state.modelSelection;
    };
    const getEdgeBlurAmount = (): number => {
      return state.edgeBlurAmount;
    };

    const updateState = (params: { modelSelection: TModelSelection; edgeBlurAmount: number }) => {
      state = { ...state, ...params };
    };
    const updateOptionsSelfieSegmentation = () => {
      const GENERAL = 0;
      const LANDSCAPE = 1;

      console.log(
        '🚀 ~ file: index.ts ~ line 76 ~ updateOptionsSelfieSegmentation ~ updateOptionsSelfieSegmentation'
      );
      selfieSegmentation.setOptions({
        modelSelection: getModelSelection() === 'general' ? GENERAL : LANDSCAPE,
      });
    };

    const changeParams = (params: { modelSelection: TModelSelection; edgeBlurAmount: number }) => {
      updateState(params);

      updateOptionsSelfieSegmentation();

      return Promise.resolve();
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
      updateState({ modelSelection, edgeBlurAmount });
      updateOptionsSelfieSegmentation();

      return createVideo(mediaStream).then(() => {
        const { width, height } = videoSource;

        console.log(
          '🚀 ~ file: index.ts ~ line 102 ~ returncreateVideo ~ width, height ',
          width,
          height
        );

        canvasTarget = createCanvas(width, height);

        console.log('🚀 ~ file: index.ts ~ line 104 ~ returncreateVideo ~ startVideoProcessing');

        return startVideoProcessing({
          selfieSegmentation,
          fpsMeter,
          getImageBitmapByWidth,
          canvasTarget,
          videoSource,
          getEdgeBlurAmount,
        }).then(() => {
          const mediaStreamOutput = canvasTarget.captureStream();

          return mediaStreamOutput;
        });
      });
    };
    const stopVideoProcessing = (): Promise<void> => {
      fpsMeter.reset();

      return selfieSegmentation.close();
    };
    const stop = () => {
      return stopVideoProcessing().then(() => {
        if (videoSource) {
          videoSource.srcObject = null;
        }
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
      return stop()
        .then(createSelfieSegmentation)
        .then((_selfieSegmentation) => {
          // eslint-disable-next-line no-param-reassign
          selfieSegmentation = _selfieSegmentation;
        })
        .then(() => {
          return start({
            mediaStream,
            modelSelection,
            edgeBlurAmount,
          });
        });
    };

    return { start, restart, changeParams, stop };
  });
};
export default resolveProcessVideoMediaPipe;
