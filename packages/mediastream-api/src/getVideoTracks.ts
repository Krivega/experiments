const getVideoTracks = (mediaStream: MediaStream): MediaStreamTrack[] => {
  return mediaStream.getTracks().filter(({ kind }) => {
    return kind === 'video';
  });
};

export default getVideoTracks;
