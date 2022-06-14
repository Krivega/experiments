import repeatedCalls from 'repeated-calls';

const stopTracksMediaStream = (mediaStream) =>
  Promise.all(
    mediaStream.getTracks().map((track) => {
      const stopTrack = () => {
        track.stop();
      };
      const isEndedTrack = () => {
        return track.readyState === 'ended';
      };

      return repeatedCalls({
        targetFunction: stopTrack,
        isComplette: isEndedTrack,
      });
    })
  );

export default stopTracksMediaStream;
