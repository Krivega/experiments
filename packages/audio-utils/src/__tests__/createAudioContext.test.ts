/// <reference types="jest" />
import { AudioContextMock } from '../__test-utils__';
import createAudioContext from '../createAudioContext';

describe('createAudioContext', () => {
  it('#1 should be created audio context', () => {
    const audioContext = createAudioContext();
    const audioContextMocked = new AudioContextMock();

    expect(JSON.stringify(audioContext)).toBe(JSON.stringify(audioContextMocked));
  });
});
