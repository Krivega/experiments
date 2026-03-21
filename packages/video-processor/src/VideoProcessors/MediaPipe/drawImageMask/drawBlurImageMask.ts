import { canvasUtils } from '@experiments/utils';

import type { TCanvas } from '@experiments/utils';

const drawBlurImageMask = ({
  videoSource,
  canvas,
  personMask,
  edgeBlurAmount,
}: {
  videoSource: HTMLVideoElement;
  canvas: TCanvas;
  personMask: ImageBitmap;
  edgeBlurAmount: number;
}) => {
  const { width, height } = videoSource;
  const context = canvasUtils.getContext(canvas) as CanvasRenderingContext2D;

  context.save();
  // render original image
  context.drawImage(videoSource, 0, 0);

  canvasUtils.drawWithCompositing(context, personMask, 'destination-in', width, height);

  context.filter = `blur(${edgeBlurAmount}px)`;

  canvasUtils.drawWithCompositing(context, videoSource, 'destination-over', width, height);

  context.filter = 'none';

  context.restore();
};

export default drawBlurImageMask;
