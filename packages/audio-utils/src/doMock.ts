import { AudioContextMock } from './__test-utils__';

declare let global: {
  AudioContext: typeof AudioContextMock;
};

const doMock = () => {
  global.AudioContext = AudioContextMock;
};

export default doMock;
