import { Camera } from '@mediapipe/camera_utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import type { ResultsListener } from '@mediapipe/selfie_segmentation';
import createFpsMeter from '@experiments/utils/src/createFpsMeter';
import mediaStreamToVideo from '@experiments/utils/src/mediaStreamToVideo';
import { createCanvas } from '@experiments/utils/src/canvas';
import type { TResolveProcessVideo, TModelSelection } from '../../typings';
import drawImageMask from './drawImageMask';

const createSelfieSegmentation = (): Promise<SelfieSegmentation> => {
  const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
      console.log('🚀 ~ file: index.ts ~ line 17 ~ file', file);

      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    },
  });

  return selfieSegmentation.initialize().then(() => {
    console.log('🚀 ~ file: index.ts ~ line 22 ~ returnselfieSegmentation.initialize ~ then');

    return selfieSegmentation;
  });
};

const resolveProcessVideoMediaPipe: TResolveProcessVideo = ({
  imageBitmapMask360p,
  imageBitmapMask720p,
  imageBitmapMask1080p,
}) => {
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

      const onResults: ResultsListener = (results) => {
        drawImageMask({
          edgeBlurAmount,
          personMask: results.segmentationMask as ImageBitmap,
          imageMask: imageBitmapMask,
          canvas: canvasTarget,
          videoSource: results.image as unknown as HTMLVideoElement,
        });
        fpsMeter.end();
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
    const stopVideoProcessing = (): Promise<void> => {
      fpsMeter.reset();

      return Promise.resolve();

      // return selfieSegmentation.close();
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
  });
};
export default resolveProcessVideoMediaPipe;
