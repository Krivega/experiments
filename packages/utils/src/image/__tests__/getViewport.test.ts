/// <reference types="jest" />
import getViewport from '../getViewport';

const desiredWidth = 1920;
const desiredHeight = 1080;

describe('getViewport', () => {
  it('get for big horizontal viewport by height', () => {
    const mockViewport = { width: 4000, height: 3000 };
    const cropedSize = { scale: 0.36, width: 1440, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for big horizontal viewport by width', () => {
    const mockViewport = { width: 8000, height: 3000 };
    const cropedSize = { scale: 0.24, width: desiredWidth, height: 720 };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for big vertical viewport by height', () => {
    const mockViewport = { width: 3000, height: 4000 };
    const cropedSize = { scale: 0.27, width: 810, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for big vertical viewport by width', () => {
    const mockViewport = { width: 3000, height: 8000 };
    const cropedSize = { scale: 0.135, width: 405, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for big square viewport', () => {
    const mockViewport = { width: 4000, height: 4000 };
    const cropedSize = { scale: 0.27, width: desiredHeight, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for big width viewport and small height', () => {
    const mockViewport = { width: 4000, height: 400 };
    const cropedSize = { scale: 0.48, width: desiredWidth, height: 192 };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for big width viewport', () => {
    const mockViewport = { width: 4000, height: desiredHeight };
    const cropedSize = { scale: 0.48, width: desiredWidth, height: 518 };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for big height viewport and small width', () => {
    const mockViewport = { width: 400, height: 4000 };
    const cropedSize = { scale: 0.27, width: 108, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for big height viewport', () => {
    const mockViewport = { width: desiredWidth, height: 4000 };
    const cropedSize = { scale: 0.27, width: 518, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for equal viewport', () => {
    const mockViewport = { width: desiredWidth, height: desiredHeight };
    const cropedSize = { scale: 1, width: desiredWidth, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for small horizontal viewport by height', () => {
    const mockViewport = { width: 400, height: 300 };
    const cropedSize = { scale: 3.6, width: 1440, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for small horizontal viewport by width', () => {
    const mockViewport = { width: 800, height: 300 };
    const cropedSize = { scale: 2.4, width: desiredWidth, height: 720 };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for small vertical viewport by height', () => {
    const mockViewport = { width: 300, height: 400 };
    const cropedSize = { scale: 2.7, width: 810, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });

  it('get for small vertical viewport by width', () => {
    const mockViewport = { width: 300, height: 800 };
    const cropedSize = { scale: 1.35, width: 405, height: desiredHeight };

    const { scale, width, height } = getViewport({
      desiredWidth,
      desiredHeight,
      ...mockViewport,
    });

    expect(scale).toBe(cropedSize.scale);
    expect(width).toBe(cropedSize.width);
    expect(height).toBe(cropedSize.height);
  });
});
