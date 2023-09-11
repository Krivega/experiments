import { createCanvas } from '@experiments/utils/src/canvas';
import createFpsMeter from '@experiments/utils/src/createFpsMeter';
import mediaStreamToVideo from '@experiments/utils/src/mediaStreamToVideo';
import { Camera } from '@mediapipe/camera_utils';
import type { ResultsListener } from '@mediapipe/selfie_segmentation';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import AnimationRequest from 'request-animation-runner';
import type { TModelSelection } from '../../typings';
import drawImageMask from '../MediaPipe/drawImageMask';

const resolveProcessVideoMediaPipe = ({
  imageBitmapMask360p,
  imageBitmapMask720p,
  imageBitmapMask1080p,
}) => {
  const fpsMeter = createFpsMeter();
  const animationRequest = new AnimationRequest();
  let requestIDBodySegmentationFrame;
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
  const startVideoProcessing = ({ modelSelection }: { modelSelection: TModelSelection }) => {
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
        // @ts-ignore
        personMask: results.segmentationMask,
        imageMask: imageBitmapMask,
        canvas: canvasTarget,
        // @ts-ignore
        videoSource: results.image,
      });
      fpsMeter.end();
    };

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      },
    });

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
  }: {
    mediaStream: MediaStream;
    modelSelection: TModelSelection;
  }) => {
    return createVideo(mediaStream).then(() => {
      const { width, height } = videoSource;

      canvasTarget = createCanvas(width, height);

      startVideoProcessing({ modelSelection });

      const mediaStreamOutput = canvasTarget.captureStream();

      return mediaStreamOutput;
    });
  };
  const stopVideoProcessing = () => {
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

  const changeParams = ({ modelSelection }: { modelSelection: TModelSelection }) => {
    return stopVideoProcessing()
      .then(() => {})
      .then(() => {
        return startVideoProcessing({ modelSelection });
      });
  };
  const restart = ({
    mediaStream,
    modelSelection,
  }: {
    mediaStream: MediaStream;
    modelSelection: TModelSelection;
  }) => {
    return stop().then(() => {
      return start({
        mediaStream,
        modelSelection,
      });
    });
  };

  return { start, restart, changeParams, stop };
};
export default resolveProcessVideoMediaPipe;
