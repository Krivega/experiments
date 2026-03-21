const hasExistsAudioTracks = (mediaStream: MediaStream): boolean => {
  return mediaStream.getAudioTracks().length > 0;
};

export default hasExistsAudioTracks;
