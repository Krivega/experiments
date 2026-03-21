import { canvasUtils } from '@experiments/utils';

import type { TCanvas } from '@experiments/utils';

const drawImageMask = ({
  videoSource,
  canvas,
  imageMask,
  personMask,
  edgeBlurAmount,
}: {
  videoSource: HTMLVideoElement;
  canvas: TCanvas;
  imageMask: HTMLImageElement;
  personMask?: ImageBitmap;
  edgeBlurAmount: number;
}) => {
  const { width, height } = videoSource;
  const context = canvasUtils.getContext(canvas) as CanvasRenderingContext2D;

  if (!personMask) {
    context.drawImage(videoSource, 0, 0);

    return;
  }

  context.save();

  // render original image
  context.drawImage(videoSource, 0, 0);

  if (edgeBlurAmount > 0) {
    context.filter = `blur(${edgeBlurAmount}px)`;
  }

  canvasUtils.drawWithCompositing(context, personMask, 'destination-out', width, height);
  context.filter = 'none';

  canvasUtils.drawWithCompositing(context, imageMask, 'destination-over', width, height);

  context.restore();
};

export default drawImageMask;
