export type TCanvas = HTMLCanvasElement | OffscreenCanvas;

export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  return canvas;
};

export const getContext = <T = CanvasRenderingContext2D>(
  canvas: TCanvas,
  {
    type = '2d',
    imageSmoothingQuality,
    globalCompositeOperation,
    alpha = false,
  }: {
    type?: '2d';
    imageSmoothingQuality?: ImageSmoothingQuality;
    globalCompositeOperation?: GlobalCompositeOperation;
    alpha?: boolean;
  } = {}
): T => {
  const context = canvas.getContext(type, {
    alpha,
    desynchronized: true,
    willReadFrequently: true,
  }) as CanvasRenderingContext2D;

  if (imageSmoothingQuality) {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = imageSmoothingQuality;
  }

  if (globalCompositeOperation) {
    context.globalCompositeOperation = globalCompositeOperation;
  }

  const contextReturned = context as unknown as T;

  return contextReturned;
};

export const createOffScreenCanvas = (width: number, height: number): OffscreenCanvas => {
  const offScreenCanvas = new OffscreenCanvas(width, height);

  return offScreenCanvas;
};

export const fill = (
  canvas: TCanvas,
  {
    x = 0,
    y = 0,
    width,
    height,
    color = '#202020',
  }: {
    x?: number;
    y?: number;
    width: number;
    height: number;
    color?: string;
  }
) => {
  const context = getContext(canvas);

  context.fillStyle = color;
  context.fillRect(x, y, width, height);
};

const getImageSizes = (image: CanvasImageSource | ImageBitmap) => {
  const { height, width } = image as { width: number; height: number };

  return { height, width };
};

export const renderImageDataToCanvas = (image: ImageData, canvas) => {
  const context = getContext(canvas);

  context.putImageData(image, 0, 0);
};

export const renderImageToCanvas = (
  image: CanvasImageSource,
  canvas: TCanvas,
  {
    x = 0,
    y = 0,
    width,
    height,
    imageSmoothingQuality,
    alpha,
    globalCompositeOperation,
  }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    imageSmoothingQuality?: ImageSmoothingQuality;
    alpha?: boolean;
    globalCompositeOperation?: GlobalCompositeOperation;
  } = {}
) => {
  const imageSizes = getImageSizes(image);
  const targetWidth = width || imageSizes.width;
  const targetHeight = height || imageSizes.height;
  const context = getContext(canvas, { imageSmoothingQuality, alpha, globalCompositeOperation });

  context.drawImage(image, x, y, targetWidth, targetHeight);
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

export const drawAndBlurImageOnOffScreenCanvas = ({
  canvas,
  image,
  blurAmount,
}: {
  canvas: OffscreenCanvas;
  image: CanvasImageSource;
  blurAmount: number;
}) => {
  if (blurAmount === 0) {
    renderImageToCanvas(image, canvas);
  } else {
    drawAndBlurImageOnCanvas(image, blurAmount, canvas);
  }
};

export const drawWithCompositing = (
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  compositeOperation,
  desiredWidth,
  desiredHeight
) => {
  context.globalCompositeOperation = compositeOperation;

  const { width, height } = image;

  context.drawImage(
    image,
    0,
    0,
    // @ts-ignore
    width,
    height,
    0,
    0,
    desiredWidth,
    desiredHeight
  );
};

export const imageBitmapToImageData = (canvas, imageBitmap, desiredWidth, desiredHeight) => {
  const { width, height } = imageBitmap;
  const context = getContext(canvas);

  context.drawImage(imageBitmap, 0, 0, width, height, 0, 0, desiredWidth, desiredHeight);

  const imageData = context.getImageData(0, 0, desiredWidth, desiredHeight);

  return imageData;
};

export const imageToImageBitmap = ({
  canvas,
  image,
}: {
  canvas: OffscreenCanvas;
  image: CanvasImageSource;
}) => {
  renderImageToCanvas(image, canvas);

  return canvas.transferToImageBitmap();
};
