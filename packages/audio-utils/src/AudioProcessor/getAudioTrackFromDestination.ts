import logger from '../logger';

const loggerGetAudioTrackFromDestination = logger.extend('getAudioTrackFromDestination');

const getAudioTrackFromDestination = (
  mediaStreamDestination: MediaStreamAudioDestinationNode,
): MediaStreamTrack => {
  const { stream } = mediaStreamDestination;
  const [audioTrack] = stream.getAudioTracks();

  loggerGetAudioTrackFromDestination('audioTrack: %o', {
    enabled: audioTrack.enabled,
    muted: audioTrack.muted,
  });

  return audioTrack;
};

export default getAudioTrackFromDestination;
