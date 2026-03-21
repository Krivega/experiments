export const addEventListenerVideoTrack = (
  track: MediaStreamTrack,
  eventName: string,
  handler: () => void,
) => {
  const { kind, readyState, enabled } = track;

  if (kind === 'video' && readyState === 'live' && enabled) {
    track.addEventListener(eventName, handler);
  }
};

const addEventListenerMediaStreamByTrack = (
  mediaStream: MediaStream,
  eventName: string,
  handler: () => void,
) => {
  for (const track of mediaStream.getTracks()) {
    addEventListenerVideoTrack(track, eventName, handler);
  }
};

export const removeEventListenerVideoTrack = (
  track: MediaStreamTrack,
  eventName: string,
  handler: () => void,
) => {
  const { kind } = track;

  if (kind === 'video') {
    track.removeEventListener(eventName, handler);
  }
};

const removeEventListenerMediaStreamByTrack = (
  mediaStream: MediaStream,
  eventName: string,
  handler: () => void,
) => {
  for (const track of mediaStream.getTracks()) {
    removeEventListenerVideoTrack(track, eventName, handler);
  }
};

const removeEventListenerInactiveMediaStream = (mediaStream: MediaStream, callback: () => void) => {
  mediaStream.removeEventListener('inactive', callback);
  removeEventListenerMediaStreamByTrack(mediaStream, 'ended', callback);
};

export const addEventListenerInactiveMediaStream = (
  mediaStream: MediaStream,
  callback: () => void,
) => {
  mediaStream.addEventListener('inactive', callback);
  addEventListenerMediaStreamByTrack(mediaStream, 'ended', callback);

  return () => {
    removeEventListenerInactiveMediaStream(mediaStream, callback);
  };
};
