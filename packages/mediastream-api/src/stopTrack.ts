import { repeatedCalls } from 'repeated-calls';

const stopTrack = async (track: MediaStreamTrack) => {
  const stop = (): undefined => {
    track.stop();

    return undefined;
  };
  const isEndedTrack = () => {
    return track.readyState === 'ended';
  };

  return repeatedCalls<undefined>({
    targetFunction: stop,
    isComplete: isEndedTrack,
  });
};

export default stopTrack;
