/* eslint-disable @typescript-eslint/no-unnecessary-condition */
// @ts-ignore
import doMockexperimentsUtils from '@experiments/utils/doMock';
import { doMock as doMockWebrtc } from 'webrtc-mock';

const doMock = () => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!global.navigator) {
    // @ts-ignore
    global.navigator = {};
  }

  doMockWebrtc();
  doMockexperimentsUtils();
};

export default doMock;
