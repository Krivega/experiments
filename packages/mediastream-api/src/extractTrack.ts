/**
 * extractVideoTrack
 * @param {Object} mediaStream mediaStream
 * @returns {function} mediaStream.getVideoTracks
 */
export const extractVideoTrack = (mediaStream) => {
  return mediaStream.getVideoTracks()[0];
};

/**
 * extractAudioTrack
 * @param {Object} mediaStream mediaStream
 * @returns {function} mediaStream.getAudioTracks
 */
export const extractAudioTrack = (mediaStream) => {
  return mediaStream.getAudioTracks()[0];
};
