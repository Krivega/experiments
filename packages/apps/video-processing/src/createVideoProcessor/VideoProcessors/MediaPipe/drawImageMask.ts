import { getContext, drawWithCompositing } from '../../../utils/canvas';
import type { TCanvas } from '../../../utils/canvas';

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
  const context = getContext(canvas);

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

  drawWithCompositing(context, personMask, 'destination-in', width, height);
  context.filter = 'none';

  drawWithCompositing(context, imageMask, 'destination-over', width, height);

  context.restore();
};

export default drawImageMask;
