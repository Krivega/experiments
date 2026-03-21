/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

export const requestFullScreen = async (element: HTMLElement) => {
  let result = Promise.resolve();

  if (element.requestFullscreen) {
    result = element.requestFullscreen();
    // @ts-expect-error
  } else if (element.mozRequestFullscreen) {
    // @ts-expect-error
    result = element.mozRequestFullScreen();
    // @ts-expect-error
  } else if (element.webkitRequestFullscreen) {
    // @ts-expect-error
    result = element.webkitRequestFullscreen(window.Element.ALLOW_KEYBOARD_INPUT);
    // @ts-expect-error
  } else if (element.webkitRequestFullScreen) {
    // @ts-expect-error
    result = element.webkitRequestFullScreen(window.Element.ALLOW_KEYBOARD_INPUT);
  }

  if (!result?.then) {
    result = Promise.resolve(); // in IOS result it's undefined
  }

  await result;
};

export const hasSupportedFullScreen = (): boolean => {
  return !!(
    document.fullscreenEnabled ??
    // @ts-expect-error
    document.mozFullScreenEnabled ??
    // @ts-expect-error
    document.documentElement.webkitRequestFullscreen ??
    // @ts-expect-error
    document.documentElement.webkitRequestFullScreen
  );
};

export const hasActiveFullScreen = (): boolean => {
  return !!(
    document.fullscreenElement ??
    // @ts-expect-error
    document.mozFullScreenElement ??
    // @ts-expect-error
    document.webkitFullscreenElement ??
    // @ts-expect-error
    document.webkitFullScreenElement
  );
};

export const cancelFullScreen = () => {
  if (!hasActiveFullScreen()) {
    return Promise.resolve();
  }

  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }

  // @ts-expect-error
  if (document.cancelFullScreen) {
    // @ts-expect-error
    return document.cancelFullScreen();
  }

  // @ts-expect-error
  if (document.mozCancelFullScreen) {
    // @ts-expect-error
    return document.mozCancelFullScreen();
  }

  // @ts-expect-error
  if (document.webkitCancelFullScreen) {
    // @ts-expect-error
    return document.webkitCancelFullScreen();
  }

  return Promise.resolve();
};

export const toggleFullScreen = (element: HTMLElement) => {
  if (hasActiveFullScreen()) {
    return cancelFullScreen();
  }

  return requestFullScreen(element);
};

const propertiesEvent = {
  passive: true,
};

export const onFullScreenChange = (handler: () => void) => {
  document.addEventListener('fullscreenchange', handler, propertiesEvent);
  document.addEventListener('mozfullscreenchange', handler, propertiesEvent);
  document.addEventListener('webkitfullscreenchange', handler, propertiesEvent);
};

export const offFullScreenChange = (handler: () => void) => {
  document.removeEventListener('fullscreenchange', handler);
  document.removeEventListener('mozfullscreenchange', handler);
  document.removeEventListener('webkitfullscreenchange', handler);
};
