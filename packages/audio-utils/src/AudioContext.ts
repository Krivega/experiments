/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

const AudioContext =
  window.AudioContext ||
  // @ts-expect-error
  window.webkitAudioContext ||
  // @ts-expect-error
  window.mozAudioContext ||
  // @ts-expect-error
  window.msAudioContext ||
  // @ts-expect-error
  window.oAudioContext;

export default AudioContext;
