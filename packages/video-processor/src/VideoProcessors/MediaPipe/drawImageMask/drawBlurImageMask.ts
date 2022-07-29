import { getContext, drawWithCompositing } from '@experiments/utils/src/canvas';
import type { TCanvas } from '@experiments/utils/src/canvas';

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
  const context = getContext(canvas);

  context.save();
  // render original image
  context.drawImage(videoSource, 0, 0);

  drawWithCompositing(context, personMask, 'destination-in', width, height);

  context.filter = `blur(${edgeBlurAmount}px)`;

  drawWithCompositing(context, videoSource, 'destination-over', width, height);

  context.filter = 'none';

  context.restore();
};

export default drawBlurImageMask;
