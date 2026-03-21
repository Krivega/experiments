/// <reference types="jest" />
import getImageSize from '../getImageSize';

const desiredWidth = 1920;
const desiredHeight = 1080;

describe('getImageSize', () => {
  it('get for big horizontal image by height', () => {
    const mockImage = { width: 4000, height: 3000 } as HTMLImageElement;
    const croppedSize = { scale: 0.36, width: 1440, height: desiredHeight };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toBe(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for big horizontal image by width', () => {
    const mockImage = { width: 8000, height: 3000 } as HTMLImageElement;
    const croppedSize = { scale: 0.24, width: desiredWidth, height: 720 };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toBe(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for big vertical image by height', () => {
    const mockImage = { width: 3000, height: 4000 } as HTMLImageElement;
    const croppedSize = { scale: 0.27, width: 810, height: desiredHeight };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toBe(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for big vertical image by width', () => {
    const mockImage = { width: 3000, height: 8000 } as HTMLImageElement;
    const croppedSize = { scale: 0.135, width: 405, height: desiredHeight };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toBe(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for big square image', () => {
    const mockImage = { width: 4000, height: 4000 } as HTMLImageElement;
    const croppedSize = { scale: 0.27, width: desiredHeight, height: desiredHeight };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toBe(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for big width image and small height', () => {
    const mockImage = { width: 4000, height: 400 } as HTMLImageElement;
    const croppedSize = { scale: 0.48, width: desiredWidth, height: 192 };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toBe(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for big width image', () => {
    const mockImage = { width: 4000, height: desiredHeight } as HTMLImageElement;
    const croppedSize = { scale: 0.48, width: desiredWidth, height: 518 };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toBe(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for big height image and small width', () => {
    const mockImage = { width: 400, height: 4000 } as HTMLImageElement;
    const croppedSize = { scale: 0.27, width: 108, height: desiredHeight };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toBe(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for big height image', () => {
    const mockImage = { width: desiredWidth, height: 4000 } as HTMLImageElement;
    const croppedSize = { scale: 0.27, width: 518, height: desiredHeight };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toBe(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for equal image', () => {
    const mockImage = { width: desiredWidth, height: desiredHeight } as HTMLImageElement;
    const croppedSize = { scale: 1, width: desiredWidth, height: desiredHeight };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toEqual(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for small horizontal image by height', () => {
    const mockImage = { width: 400, height: 300 } as HTMLImageElement;
    const croppedSize = { scale: 1, width: mockImage.width, height: mockImage.height };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toEqual(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for small horizontal image by width', () => {
    const mockImage = { width: 800, height: 300 } as HTMLImageElement;
    const croppedSize = { scale: 1, width: mockImage.width, height: mockImage.height };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toEqual(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for small vertical image by height', () => {
    const mockImage = { width: 300, height: 400 } as HTMLImageElement;
    const croppedSize = { scale: 1, width: mockImage.width, height: mockImage.height };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toEqual(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for small vertical image by width', () => {
    const mockImage = { width: 300, height: 800 } as HTMLImageElement;
    const croppedSize = { scale: 1, width: mockImage.width, height: mockImage.height };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toEqual(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for some image', () => {
    const mockImage = { width: 4928, height: 3264 } as HTMLImageElement;
    const croppedSize = { scale: 0.330_882_352_941_176_46, width: 1630, height: desiredHeight };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toEqual(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });

  it('get for some image 2', () => {
    const mockImage = { width: 2400, height: 3604 } as HTMLImageElement;
    const croppedSize = { scale: 0.299_667_036_625_971_16, width: 719, height: desiredHeight };

    const { scale, width, height } = getImageSize({
      desiredWidth,
      desiredHeight,
      image: mockImage,
    });

    expect(scale).toEqual(croppedSize.scale);
    expect(width).toBe(croppedSize.width);
    expect(height).toBe(croppedSize.height);
  });
});
