/// <reference types="jest" />
import resizeCover from '../resizeCover';

const desiredWidth = 256;
const desiredHeight = 192;

describe('resizeCover', () => {
  it('width = desiredWidth & height = desiredHeight', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth,
        height: desiredHeight,
      }),
    ).toEqual({
      scale: 1,
      x: 0,
      y: 0,
      width: desiredWidth,
      height: desiredHeight,
    });
  });

  it('width < desiredWidth & height < desiredHeight: proportional', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 0.5,
        height: desiredHeight * 0.5,
      }),
    ).toEqual({
      scale: 2,
      x: 0,
      y: 0,
      width: desiredWidth,
      height: desiredHeight,
    });
  });

  it('width < desiredWidth & height < desiredHeight: width > height', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 0.75,
        height: desiredHeight * 0.5,
      }),
    ).toEqual({
      scale: 2,
      x: -desiredWidth * 0.25,
      y: 0,
      width: desiredWidth * 1.5,
      height: desiredHeight,
    });
  });

  it('width < desiredWidth & height < desiredHeight: width < height', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 0.5,
        height: desiredHeight * 0.75,
      }),
    ).toEqual({
      scale: 2,
      x: 0,
      y: -desiredHeight * 0.25,
      width: desiredWidth,
      height: desiredHeight * 1.5,
    });
  });

  it('width = desiredWidth & height < desiredHeight', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth,
        height: desiredHeight * 0.5,
      }),
    ).toEqual({
      scale: 2,
      x: -desiredWidth * 0.5,
      y: 0,
      width: desiredWidth * 2,
      height: desiredHeight,
    });
  });

  it('width > desiredWidth & height < desiredHeight', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 2,
        height: desiredHeight * 0.5,
      }),
    ).toEqual({
      scale: 2,
      x: -desiredWidth * 1.5,
      y: 0,
      width: desiredWidth * 4,
      height: desiredHeight,
    });
  });

  it('width < desiredWidth & height = desiredHeight', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 0.5,
        height: desiredHeight,
      }),
    ).toEqual({
      scale: 2,
      x: 0,
      y: -desiredHeight * 0.5,
      width: desiredWidth,
      height: desiredHeight * 2,
    });
  });

  it('width < desiredWidth & height > desiredHeight', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 0.5,
        height: desiredHeight * 2,
      }),
    ).toEqual({
      scale: 2,
      x: 0,
      y: -desiredHeight * 1.5,
      width: desiredWidth,
      height: desiredHeight * 4,
    });
  });

  it('width = desiredWidth & height > desiredHeight', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth,
        height: desiredHeight * 2,
      }),
    ).toEqual({
      scale: 1,
      x: 0,
      y: -desiredHeight * 0.5,
      width: desiredWidth,
      height: desiredHeight * 2,
    });
  });

  it('width > desiredWidth & height = desiredHeight', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 2,
        height: desiredHeight,
      }),
    ).toEqual({
      scale: 1,
      x: -desiredWidth * 0.5,
      y: 0,
      width: desiredWidth * 2,
      height: desiredHeight,
    });
  });

  it('width > desiredWidth & height > desiredHeight: proportional', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 2,
        height: desiredHeight * 2,
      }),
    ).toEqual({
      scale: 0.5,
      x: 0,
      y: 0,
      width: desiredWidth,
      height: desiredHeight,
    });
  });

  it('width > desiredWidth & height > desiredHeight: : width > height', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 4,
        height: desiredHeight * 2,
      }),
    ).toEqual({
      scale: 0.5,
      x: -desiredWidth * 0.5,
      y: 0,
      width: desiredWidth * 2,
      height: desiredHeight,
    });
  });

  it('width > desiredWidth & height > desiredHeight: : width < height', () => {
    expect(
      resizeCover({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 2,
        height: desiredHeight * 4,
      }),
    ).toEqual({
      scale: 0.5,
      x: 0,
      y: -desiredHeight * 0.5,
      width: desiredWidth,
      height: desiredHeight * 2,
    });
  });
});
