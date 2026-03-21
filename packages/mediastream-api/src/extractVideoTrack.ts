const extractVideoTrack = (mediaStream: MediaStream): MediaStreamVideoTrack => {
  return mediaStream.getVideoTracks()[0];
};

export default extractVideoTrack;
