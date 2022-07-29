import { getContext, drawWithCompositing } from '@experiments/utils/src/canvas';
import type { TCanvas } from '@experiments/utils/src/canvas';

const drawBackgroundImageMask = ({
  videoSource,
  canvas,
  imageMask,
  personMask,
  edgeBlurAmount,
}: {
  videoSource: HTMLVideoElement;
  canvas: TCanvas;
  imageMask: HTMLImageElement;
  personMask: ImageBitmap;
  edgeBlurAmount: number;
}) => {
  const { width, height } = videoSource;
  const context = getContext(canvas);

  context.save();

  // render original image
  context.drawImage(videoSource, 0, 0);

  if (edgeBlurAmount > 0) {
    context.filter = `blur(${edgeBlurAmount}px)`;
  }

  drawWithCompositing(context, personMask, 'destination-in', width, height);

  context.filter = 'none';

  drawWithCompositing(context, imageMask, 'destination-over', width, height);

  context.restore();
};

export default drawBackgroundImageMask;
