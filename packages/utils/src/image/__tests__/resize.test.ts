/// <reference types="jest" />
import resize from '../resize';

const desiredWidth = 256;
const desiredHeight = 192;

describe('resize', () => {
  it('to equal', () => {
    expect(
      resize({
        desiredWidth,
        desiredHeight,
        width: desiredWidth,
        height: desiredHeight,
      }),
    ).toEqual({
      scale: 1,
      width: desiredWidth,
      height: desiredHeight,
    });
  });

  it('to bigger widths', () => {
    expect(
      resize({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 2,
        height: desiredHeight,
      }),
    ).toEqual({
      scale: 0.5,
      width: desiredWidth,
      height: desiredHeight * 0.5,
    });
  });

  it('to bigger widths and heights', () => {
    expect(
      resize({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 2,
        height: desiredHeight * 2,
      }),
    ).toEqual({
      scale: 0.5,
      width: desiredWidth,
      height: desiredHeight,
    });
  });

  it('to bigger heights', () => {
    expect(
      resize({
        desiredWidth,
        desiredHeight,
        width: desiredWidth,
        height: desiredHeight * 2,
      }),
    ).toEqual({
      scale: 0.5,
      width: desiredWidth * 0.5,
      height: desiredHeight,
    });
  });

  it('to smaller widths', () => {
    expect(
      resize({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 0.5,
        height: desiredHeight,
      }),
    ).toEqual({
      scale: 1,
      width: desiredWidth * 0.5,
      height: desiredHeight,
    });
  });

  it('to smaller heights', () => {
    expect(
      resize({
        desiredWidth,
        desiredHeight,
        width: desiredWidth,
        height: desiredHeight * 0.5,
      }),
    ).toEqual({
      scale: 1,
      width: desiredWidth,
      height: desiredHeight * 0.5,
    });
  });

  it('to smaller widths and heights', () => {
    expect(
      resize({
        desiredWidth,
        desiredHeight,
        width: desiredWidth * 0.5,
        height: desiredHeight * 0.5,
      }),
    ).toEqual({
      scale: 1,
      width: desiredWidth * 0.5,
      height: desiredHeight * 0.5,
    });
  });
});
