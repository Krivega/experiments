/// <reference types="jest" />

import { screenFullUtils } from '../..';

describe('screenFull', () => {
  let handler: jest.Mock;

  beforeEach(() => {
    handler = jest.fn();

    // @ts-expect-error
    document.fullscreenElement = false;
    // @ts-expect-error
    document.mozFullScreenEnabled = false;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('toggleFullScreen: should call element.requestFullscreen when fullscreenElement is falsy', () => {
    document.exitFullscreen = jest.fn();

    const element = {
      requestFullscreen: jest.fn(),
    } as unknown as HTMLElement;

    screenFullUtils.toggleFullScreen(element);

    expect(document.exitFullscreen).toHaveBeenCalledTimes(0);
    expect(element.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('toggleFullScreen: should call document.exitFullscreen when fullscreenElement is truthy', () => {
    // @ts-expect-error
    document.fullscreenElement = true;
    document.exitFullscreen = jest.fn();

    const element = {
      requestFullscreen: jest.fn(),
    } as unknown as HTMLElement;

    screenFullUtils.toggleFullScreen(element);

    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
    expect(element.requestFullscreen).toHaveBeenCalledTimes(0);
  });

  it('cancelFullScreen: should resolve immediately if there is no active full screen', () => {
    document.exitFullscreen = jest.fn();

    screenFullUtils.cancelFullScreen();

    expect(document.exitFullscreen).toHaveBeenCalledTimes(0);
  });

  it('cancelFullScreen: should call document.exitFullscreen if available', () => {
    // @ts-expect-error
    document.fullscreenElement = true;

    document.exitFullscreen = jest.fn();

    screenFullUtils.cancelFullScreen();

    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it('hasActiveFullScreen: should return true if any fullscreen element is active', () => {
    // @ts-expect-error
    document.fullscreenElement = true;

    expect(screenFullUtils.hasActiveFullScreen()).toBe(true);
  });

  it('hasActiveFullScreen: should return false if no fullscreen element is active', () => {
    expect(screenFullUtils.hasActiveFullScreen()).toBe(false);
  });

  it('requestFullScreen: should return a Promise when requestFullscreen is sync function', async () => {
    const element = {
      requestFullscreen: jest.fn(),
    } as unknown as HTMLElement;

    const result = screenFullUtils.requestFullScreen(element);

    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeUndefined();
  });

  it('requestFullScreen: should call requestFullscreen if it exists', async () => {
    const element = {
      requestFullscreen: jest.fn(),
    } as unknown as HTMLElement;

    await screenFullUtils.requestFullScreen(element);

    expect(element.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it('hasSupportedFullScreen: returns true when fullscreen is supported', () => {
    // @ts-expect-error
    document.fullscreenEnabled = true;

    expect(screenFullUtils.hasSupportedFullScreen()).toBe(true);
  });

  it('hasSupportedFullScreen: returns true when fullscreen is supported in different browsers', () => {
    // @ts-expect-error
    document.mozFullScreenEnabled = true;
    // @ts-expect-error
    document.documentElement.webkitRequestFullscreen = jest.fn();

    expect(screenFullUtils.hasSupportedFullScreen()).toBe(true);
  });

  it('hasSupportedFullScreen: returns false when fullscreen is not supported', () => {
    // @ts-expect-error
    document.fullscreenEnabled = false;
    // @ts-expect-error
    document.mozFullScreenEnabled = false;
    // @ts-expect-error
    document.documentElement.webkitRequestFullscreen = undefined;

    expect(screenFullUtils.hasSupportedFullScreen()).toBe(false);
  });

  it('onFullScreenChange: should add event listeners for fullscreenchange, mozfullscreenchange, and webkitfullscreenchange', () => {
    const addEventListenerMocked = jest.spyOn(document, 'addEventListener');

    screenFullUtils.onFullScreenChange(handler);

    expect(addEventListenerMocked).toHaveBeenCalledTimes(3);
    expect(addEventListenerMocked).toHaveBeenCalledWith('fullscreenchange', handler, {
      passive: true,
    });
    expect(addEventListenerMocked).toHaveBeenCalledWith('mozfullscreenchange', handler, {
      passive: true,
    });
    expect(addEventListenerMocked).toHaveBeenCalledWith('webkitfullscreenchange', handler, {
      passive: true,
    });
  });

  it('offFullScreenChange: should remove event listeners for fullscreenchange, mozfullscreenchange, and webkitfullscreenchange', () => {
    const removeEventListenerMocked = jest.spyOn(document, 'removeEventListener');

    screenFullUtils.offFullScreenChange(handler);

    expect(removeEventListenerMocked).toHaveBeenCalledTimes(3);
    expect(removeEventListenerMocked).toHaveBeenCalledWith('fullscreenchange', handler);
    expect(removeEventListenerMocked).toHaveBeenCalledWith('mozfullscreenchange', handler);
    expect(removeEventListenerMocked).toHaveBeenCalledWith('webkitfullscreenchange', handler);
  });
});
