/// <reference types="jest" />
import { createCanvas, getContext } from '..';

describe('getContext', () => {
  const width = 800;
  const height = 600;

  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = createCanvas(width, height);
  });

  it('#1 should be created context with default params', () => {
    const context = getContext(canvas) as CanvasRenderingContext2D;

    expect(context).toBeDefined();
    expect(context.globalCompositeOperation).toBe('source-over');
    expect(context.imageSmoothingQuality).toBe('low');
  });

  it('#2 should be created context with correct params', () => {
    const context = getContext(canvas, {
      imageSmoothingQuality: 'medium',
      globalCompositeOperation: 'difference',
    }) as CanvasRenderingContext2D;

    expect(context).toBeDefined();
    expect(context.globalCompositeOperation).toBe('difference');
    expect(context.imageSmoothingQuality).toBe('medium');
  });
});
