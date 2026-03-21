/// <reference types="jest" />
import { createCanvas, drawWithCompositing, getContext } from '../index';

describe('drawWithCompositing', () => {
  const width = 800;
  const height = 600;

  const mockImage = new Image(width, height);

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let drawImageMocked: jest.Mock;

  beforeEach(() => {
    drawImageMocked = jest.fn();

    canvas = createCanvas(width, height);
    context = getContext(canvas) as CanvasRenderingContext2D;

    context.drawImage = drawImageMocked;
  });

  it('#1 should be rendered image with correct parameters', () => {
    drawWithCompositing(context, mockImage, 'destination-out', width, height);

    expect(context.globalCompositeOperation).toBe('source-over');
    expect(drawImageMocked).toHaveBeenCalledWith(
      mockImage,
      0,
      0,
      width,
      height,
      0,
      0,
      width,
      height,
    );
  });
});
