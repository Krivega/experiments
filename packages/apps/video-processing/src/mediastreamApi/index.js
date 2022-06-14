import { cancelablePromise } from '@krivega/cancelable-promise';
import prepareConstraints from './prepareConstraints';

const passiveEventOptions = { passive: true };
/**
 * Gets the media stream origin.
 *
 * @param {Object} constraints - The constraints
 *
 * @returns {Promise} The media stream origin.
 */
export const getMediaStreamOrigin = (constraints, { waitTimeout = 3_000 } = {}) => {
  const getMediasStreamPromise = Promise.resolve()
    // for catch "undefined is not an object navigator.mediaDevices.enumerateDevices"
    .then(() => {
      return navigator.mediaDevices.getUserMedia(constraints);
    });

  const waitingPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const error = {
        message: `Waiting time is ending for constraints ${JSON.stringify(constraints)}`,
      };

      reject(error);
    }, waitTimeout);
  });

  return Promise.race([getMediasStreamPromise, waitingPromise]).catch((error) => {
    // eslint-disable-next-line no-param-reassign
    error.constraints = constraints;
    // eslint-enable-next-line no-param-reassign
    throw error;
  });
};

/**
 * Adds an event listener video track.
 *
 * @param {Object}   mediaStream - mediaStream
 * @param {string}   eventName   - eventName
 * @param {function} handler     - handler
 *
 * @returns {void}
 */
export const addEventListenerVideoTrack = (mediaStream, eventName, handler) => {
  mediaStream.getTracks().forEach((track) => {
    const { kind, readyState, enabled } = track;

    if (kind === 'video' && readyState === 'live' && enabled) {
      track.addEventListener(eventName, handler, passiveEventOptions);
    }
  });
};

/**
 * Removes an event listener video track.
 *
 * @param {Object}   mediaStream - mediaStream
 * @param {string}   eventName   - eventName
 * @param {function} handler     - handler
 *
 * @returns {void}
 */
export const removeEventListenerVideoTrack = (mediaStream, eventName, handler) => {
  mediaStream.getTracks().forEach((track) => {
    const { kind } = track;

    if (kind === 'video') {
      track.removeEventListener(eventName, handler, passiveEventOptions);
    }
  });
};

export const getMediaStream = (optionsConstraints, options) => {
  const constraints = prepareConstraints(optionsConstraints);

  return getMediaStreamOrigin(constraints, options);
};

export const getCancelableMediaStream = (
  optionsConstraints,
  options,
  moduleName = 'getCancelableMediaStream'
) => {
  return cancelablePromise(getMediaStream(optionsConstraints, options), moduleName);
};
