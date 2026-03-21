import { doMock as doMockWebRtc } from 'webrtc-mock';

import doMock from './doMock';

doMockWebRtc();
doMock();

declare let global: {
  isRunningAudioContextStateByDefault: boolean;
  MediaStream: typeof MediaStream;
};

global.isRunningAudioContextStateByDefault = false;
global.MediaStream = MediaStream;
