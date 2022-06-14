/**
 * extractVideoTrack
 * @param {Object} mediaStream mediaStream
 * @returns {function} mediaStream.getVideoTracks
 */
export const extractVideoTrack = (mediaStream) => mediaStream.getVideoTracks()[0];

/**
 * extractAudioTrack
 * @param {Object} mediaStream mediaStream
 * @returns {function} mediaStream.getAudioTracks
 */
export const extractAudioTrack = (mediaStream) => mediaStream.getAudioTracks()[0];
