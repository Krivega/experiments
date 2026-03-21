import stopTrack from './stopTrack';

const stopTracksMediaStream = async (mediaStream: MediaStream): Promise<void> => {
  return Promise.all(
    mediaStream.getTracks().map(async (track: MediaStreamTrack) => {
      return stopTrack(track);
    }),
  ).then(() => {});
};

export default stopTracksMediaStream;
