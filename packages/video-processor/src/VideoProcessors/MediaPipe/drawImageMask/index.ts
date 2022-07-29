import { getContext } from '@experiments/utils/src/canvas';
import type { TCanvas } from '@experiments/utils/src/canvas';
import drawBackgroundImageMask from './drawBackgroundImageMask';
import drawBlurImageMask from './drawBlurImageMask';

const drawImageMask = ({
  videoSource,
  canvas,
  imageMask,
  personMask,
  edgeBlurAmount,
  isBlurBackground,
}: {
  videoSource: HTMLVideoElement;
  canvas: TCanvas;
  imageMask: HTMLImageElement;
  personMask?: ImageBitmap;
  edgeBlurAmount: number;
  isBlurBackground: boolean;
}) => {
  if (!personMask) {
    const context = getContext(canvas);

    context.drawImage(videoSource, 0, 0);

    return;
  }

  if (isBlurBackground) {
    drawBlurImageMask({
      videoSource,
      canvas,
      personMask,
      edgeBlurAmount,
    });
  } else {
    drawBackgroundImageMask({
      videoSource,
      canvas,
      imageMask,
      personMask,
      edgeBlurAmount,
    });
  }
};

export default drawImageMask;
