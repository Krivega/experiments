const LIVE_READY_STATE_TRACK = 'live';

const hasInactiveMediaTracks = (mediaStreamTracks: MediaStreamTrack[]): boolean => {
  const isInactiveMediaTracks = mediaStreamTracks.some(
    ({ readyState }: MediaStreamTrack): boolean => {
      return readyState !== LIVE_READY_STATE_TRACK;
    },
  );

  return isInactiveMediaTracks;
};

export default hasInactiveMediaTracks;
