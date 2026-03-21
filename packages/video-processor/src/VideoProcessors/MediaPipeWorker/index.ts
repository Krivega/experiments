/* eslint-disable unicorn/no-null */
import { canvasUtils, createFpsMeter, mediaStreamToVideo } from '@experiments/utils';
import { Camera } from '@mediapipe/camera_utils';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import AnimationRequest from 'request-animation-runner';

import drawImageMask from '../MediaPipe/drawImageMask';

import type { ResultsListener } from '@mediapipe/selfie_segmentation';
import type { TModelSelection } from '../../typings';

const resolveProcessVideoMediaPipe = ({
  imageBitmapMask360p,
  imageBitmapMask720p,
  imageBitmapMask1080p,
}: {
  imageBitmapMask360p: HTMLImageElement;
  imageBitmapMask720p: HTMLImageElement;
  imageBitmapMask1080p: HTMLImageElement;
}) => {
  const fpsMeter = createFpsMeter();
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
        resolve();
        // }
      };

      check();
    });
  };
  const startVideoProcessing = ({ modelSelection }: { modelSelection: TModelSelection }) => {
    if (!videoSource) {
      throw new Error('Video source not found');
    }

    const { width, height } = videoSource;
    let imageBitmapMask: HTMLImageElement;

    // eslint-disable-next-line default-case
    switch (width) {
      case 640: {
        imageBitmapMask = imageBitmapMask360p;
        break;
      }
      case 1280: {
        imageBitmapMask = imageBitmapMask720p;
        break;
      }
      case 1920: {
        imageBitmapMask = imageBitmapMask1080p;
        break;
      }
    }

    const onResults: ResultsListener = (results) => {
      if (!videoSource) {
        throw new Error('Video source not found');
      }

      drawImageMask({
        // @ts-ignore
        personMask: results.segmentationMask,
        imageMask: imageBitmapMask,
        canvas: canvasTarget,
        // @ts-expect-error
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
  };

  const start = async ({
    mediaStream,
    modelSelection,
  }: {
    mediaStream: MediaStream;
    modelSelection: TModelSelection;
  }) => {
    return createVideo(mediaStream).then(() => {
      if (!videoSource) {
        throw new Error('Video source not found');
      }

      const { width, height } = videoSource;

      canvasTarget = canvasUtils.createCanvas(width, height);

      startVideoProcessing({ modelSelection });

      const mediaStreamOutput = canvasTarget.captureStream();

      return mediaStreamOutput;
    });
  };
  const stopVideoProcessing = async () => {
    animationRequest.deactivate();
    fpsMeter.reset();

    return checkEndProgressVideoProcessing();
  };
  const stop = async () => {
    return stopVideoProcessing().then(() => {
      if (videoSource) {
        videoSource.srcObject = null;
      }
    });
  };

  const changeParams = async ({ modelSelection }: { modelSelection: TModelSelection }) => {
    return stopVideoProcessing()
      .then(() => {})
      .then(() => {
        startVideoProcessing({ modelSelection });
      });
  };
  const restart = async ({
    mediaStream,
    modelSelection,
  }: {
    mediaStream: MediaStream;
    modelSelection: TModelSelection;
  }) => {
    return stop().then(async () => {
      return start({
        mediaStream,
        modelSelection,
      });
    });
  };

  return { start, restart, changeParams, stop };
};
export default resolveProcessVideoMediaPipe;
