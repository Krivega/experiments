type TCanvas = HTMLCanvasElement;

export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  return canvas;
};

export const getContext = (
  canvas: TCanvas,
  {
    type = '2d',
    imageSmoothingQuality,
    globalCompositeOperation,
    alpha = false,
    desynchronized = false,
    willReadFrequently,
  }: {
    type?: '2d' | 'bitmaprenderer';
    imageSmoothingQuality?: ImageSmoothingQuality;
    globalCompositeOperation?: GlobalCompositeOperation;
    alpha?: boolean;
    desynchronized?: boolean;
    willReadFrequently?: boolean;
  } = {},
) => {
  const context = canvas.getContext(type, {
    alpha,
    desynchronized,
    willReadFrequently,
  });

  if (imageSmoothingQuality && context instanceof CanvasRenderingContext2D) {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = imageSmoothingQuality;
  }

  if (globalCompositeOperation && context instanceof CanvasRenderingContext2D) {
    context.globalCompositeOperation = globalCompositeOperation;
  }

  return context;
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
  },
) => {
  const context = getContext(canvas) as CanvasRenderingContext2D;

  context.fillStyle = color;
  context.fillRect(x, y, width, height);
};

const getImageSizes = (image: CanvasImageSource | ImageBitmap) => {
  const { height, width } = image as { width: number; height: number };

  return { height, width };
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
  } = {},
) => {
  const imageSizes = getImageSizes(image);
  const targetWidth = width ?? imageSizes.width;
  const targetHeight = height ?? imageSizes.height;
  const context = getContext(canvas, {
    imageSmoothingQuality,
    alpha,
    globalCompositeOperation,
  }) as CanvasRenderingContext2D;

  context.drawImage(image, x, y, targetWidth, targetHeight);
};

export const getCanvasMediaStream = (
  canvas: HTMLCanvasElement,
  frameRate?: number,
): MediaStream => {
  const mediaStream = canvas.captureStream(frameRate);

  return mediaStream;
};

/**
 * redraw the canvas context over itself (assuming it is a 2d context)
 * by calling ctx.drawImage(ctx.canvas,0,0)
 * after having set its globalCompositeOperation to 'copy' to avoid transparency issues.
 * globalCompositeOperation removed because not working on windows
 * possibly because of alpha: false
 * not working: request frame on videoTrack and set frameRate to canvas.captureStream
 */
export const repaint = (canvas: HTMLCanvasElement, alpha = false) => {
  const globalCompositeOperation = alpha ? 'copy' : undefined;

  renderImageToCanvas(canvas, canvas, { alpha, globalCompositeOperation });
};

export const drawWithCompositing = (
  context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  image: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement | ImageBitmap | OffscreenCanvas,
  compositeOperation: GlobalCompositeOperation,
  desiredWidth: number,
  desiredHeight: number,
  // eslint-disable-next-line @typescript-eslint/max-params
) => {
  const { width } = image;
  const { height } = image;

  context.globalCompositeOperation = compositeOperation;
  context.drawImage(image, 0, 0, width, height, 0, 0, desiredWidth, desiredHeight);
  context.globalCompositeOperation = 'source-over'; // reset tto default falue
};
