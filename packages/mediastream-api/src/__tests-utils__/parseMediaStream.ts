import { testUtils } from '@experiments/utils/testUtils';

import parseTracks from './parseTracks';

const parseMediaStream = (mediaStream: MediaStream): MediaStream => {
  return testUtils.parseObject<MediaStream>({
    ...mediaStream,
    // @ts-ignore
    tracks: parseTracks(mediaStream.getTracks()),
  });
};
export const parseMediaStreamWithoutId = (mediaStream: MediaStream) => {
  const mediaStreamParsed = parseMediaStream(mediaStream);

  // @ts-ignore
  delete mediaStreamParsed.id;

  return mediaStreamParsed;
};

export default parseMediaStream;
