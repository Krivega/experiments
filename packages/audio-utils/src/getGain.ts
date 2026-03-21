import logger from './logger';

const loggerGetGain = logger.extend('getGain');

const getGain = (
  audioContext: AudioContext,
  audioTrackSource: MediaStreamTrack,
): { gainNode: GainNode; mediaStreamAudioDestinationNode: MediaStreamAudioDestinationNode } => {
  loggerGetGain('audioTrackSource: %o', {
    enabled: audioTrackSource.enabled,
    muted: audioTrackSource.muted,
  });

  const mediaStreamSourceWithAudio = new MediaStream([audioTrackSource]);
  const mediaStreamSource = audioContext.createMediaStreamSource(mediaStreamSourceWithAudio);

  const mediaStreamAudioDestinationNode = audioContext.createMediaStreamDestination();
  const gainNode = audioContext.createGain();

  mediaStreamSource.connect(gainNode);
  gainNode.connect(mediaStreamAudioDestinationNode);

  return { gainNode, mediaStreamAudioDestinationNode };
};

export default getGain;
