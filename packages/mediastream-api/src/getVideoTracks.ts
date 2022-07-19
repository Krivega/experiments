const getVideoTracks = (mediaStream) => {
  return mediaStream.getTracks().filter(({ kind }) => {
    return kind === 'video';
  });
};

export default getVideoTracks;
