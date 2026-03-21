/// <reference types="jest" />
import { createCanvas, fill, getContext } from '..';

describe('fill', () => {
  const width = 10;
  const height = 11;

  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let fillRectMocked: jest.Mock;

  beforeEach(() => {
    fillRectMocked = jest.fn();

    canvas = createCanvas(width, height);
    context = getContext(canvas) as CanvasRenderingContext2D;

    context.fillRect = fillRectMocked;
  });

  it('#1 should be filled canvas with correct parameters', () => {
    const x = 5;
    const y = 7;
    const color = '#111111';

    fill(canvas, { width, height, x, y, color });

    expect(context.fillStyle).toBe(color);
    expect(fillRectMocked).toHaveBeenCalledWith(x, y, width, height);
  });
});
