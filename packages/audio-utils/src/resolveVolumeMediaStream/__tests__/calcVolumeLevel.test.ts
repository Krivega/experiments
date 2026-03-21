/// <reference types="jest" />
import calcVolumeLevel from '../calcVolumeLevel';

describe('calcVolumeLevel', () => {
  it('by zero array', () => {
    const dataArray = new Uint8Array(32);

    const volume = calcVolumeLevel(dataArray);

    expect(volume).toBe(0);
  });

  it('base', () => {
    const dataArray = new Uint8Array([10]);

    const volume = calcVolumeLevel(dataArray);

    expect(volume).toBe(10);
  });

  it('by less 1', () => {
    const dataArray = new Uint8Array([1, 0]);
    const volume = calcVolumeLevel(dataArray);

    expect(volume).toBe(0.5);
  });

  it('by less 0', () => {
    const dataArray = [-1, 0] as unknown as Uint8Array;
    const volume = calcVolumeLevel(dataArray);

    expect(volume).toBe(0);
  });

  it('by more 100', () => {
    const dataArray = new Uint8Array([101]);

    const volume = calcVolumeLevel(dataArray);

    expect(volume).toBe(100);
  });
});
