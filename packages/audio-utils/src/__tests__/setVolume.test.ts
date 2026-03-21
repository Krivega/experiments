/// <reference types="jest" />
import setVolume from '../setVolume';

describe('setVolume', () => {
  let mediaElement: HTMLAudioElement;
  let debug: (message: string, ...parameters: unknown[]) => void;

  beforeEach(() => {
    mediaElement = document.createElement('audio');
    debug = jest.fn();
  });

  it('should set the volume of the media element', () => {
    const volume = 0.5;

    setVolume(mediaElement, volume, debug);

    expect(mediaElement.volume).toBe(volume);
    expect(debug).toHaveBeenCalledTimes(2);
    expect(debug).toHaveBeenNthCalledWith(2, 'setVolume volume !!!SET!!!', volume);
  });

  it('should not set the volume if the provided volume is undefined', () => {
    const initialVolume = 0.8;

    mediaElement.volume = initialVolume;

    setVolume(mediaElement, undefined, debug);

    expect(mediaElement.volume).toBe(initialVolume);
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it('should not set the volume if the provided volume is the same as the current volume', () => {
    const volume = 0.7;

    mediaElement.volume = volume;

    setVolume(mediaElement, volume, debug);

    expect(mediaElement.volume).toBe(volume);
    expect(debug).toHaveBeenCalledTimes(1);
  });

  it('should work without debug parameter', () => {
    const volume = 0.3;

    // Should not throw error when debug parameter is omitted
    expect(() => {
      setVolume(mediaElement, volume);
    }).not.toThrow();

    expect(mediaElement.volume).toBe(volume);
  });

  it('should handle volume change without debug parameter', () => {
    mediaElement.volume = 0.8;

    const newVolume = 0.2;

    // Should not throw error when debug parameter is omitted
    expect(() => {
      setVolume(mediaElement, newVolume);
    }).not.toThrow();

    expect(mediaElement.volume).toBe(newVolume);
  });
});
