export const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  return canvas;
};
export const createOffScreenCanvas = (width, height) => {
  const offScreenCanvas = new OffscreenCanvas(width, height);

  return offScreenCanvas;
};

export const getContext = (canvas) => {
  const context = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true,
    willReadFrequently: true,
  });

  return context;
};

export const renderImageDataToCanvas = (image, canvas) => {
  const context = getContext(canvas);

  context.putImageData(image, 0, 0);
};

export const renderImageToCanvas = (image, canvas) => {
  const context = getContext(canvas);

  context.drawImage(image, 0, 0);
};

const drawAndBlurImageOnCanvas = (image, blurAmount, canvas) => {
  const { height, width } = image;
  const context = getContext(canvas);

  context.clearRect(0, 0, width, height);
  context.save();

  context.filter = `blur(${blurAmount}px)`;
  context.drawImage(image, 0, 0, width, height);

  context.restore();
};

const drawWithCompositing = (context, image, compositeOperation, desiredWidth, desiredHeight) => {
  context.globalCompositeOperation = compositeOperation;

  const { width, height } = image;

  context.drawImage(image, 0, 0, width, height, 0, 0, desiredWidth, desiredHeight);
};

export const imageBitmapToImageData = (canvas, imageBitmap, desiredWidth, desiredHeight) => {
  const { width, height } = imageBitmap;
  const context = getContext(canvas);

  context.drawImage(imageBitmap, 0, 0, width, height, 0, 0, desiredWidth, desiredHeight);

  const imageData = context.getImageData(0, 0, desiredWidth, desiredHeight);

  return imageData;
};

export const imageToImageBitmap = ({ canvas, image }) => {
  renderImageToCanvas(image, canvas);

  return canvas.transferToImageBitmap();
};

export const drawAndBlurImageOnOffScreenCanvas = ({ canvas, image, blurAmount }) => {
  if (blurAmount === 0) {
    renderImageToCanvas(image, canvas);
  } else {
    drawAndBlurImageOnCanvas(image, blurAmount, canvas);
  }
};

export const drawImageMask = ({ image, canvas, imageMask, personMask }) => {
  const { width, height } = image;
  const context = getContext(canvas);

  if (!personMask) {
    context.drawImage(imageMask, 0, 0);

    return;
  }

  // const personMask = createPersonMask(multiPersonSegmentation, edgeBlurAmount);

  context.save();

  // render original image
  context.drawImage(image, 0, 0);

  // "destination-in" - "The existing canvas content is kept where both the
  // new shape and existing canvas content overlap. Everything else is made
  // transparent."
  // crop what's not the person using the mask from the original image
  drawWithCompositing(context, personMask, 'destination-in', width, height);

  // "destination-over" - "The existing canvas content is kept where both the
  // new shape and existing canvas content overlap. Everything else is made
  // transparent."
  // draw the blurred background on top of the original image where it doesn't
  // overlap.
  drawWithCompositing(context, imageMask, 'destination-over', width, height);

  context.restore();
};
