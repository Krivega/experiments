/// <reference types="jest" />
import { createAudioMediaStreamTrackMock } from 'webrtc-mock';

import { initAnalyser } from '../..';

describe('initAnalyser', () => {
  it('work', () => {
    const mediaStream = new MediaStream([
      createAudioMediaStreamTrackMock() as unknown as MediaStreamTrack,
    ]);
    const { getDataArray, resume, destroy } = initAnalyser(mediaStream);
    const dataArray = getDataArray();

    expect(resume).toBeDefined();
    expect(destroy).toBeDefined();
    expect(dataArray.length).toBe(2048);
  });

  it('pass fftSize', () => {
    const fftSize = 32;
    const mediaStream = new MediaStream([
      createAudioMediaStreamTrackMock() as unknown as MediaStreamTrack,
    ]);
    const { getDataArray, resume, destroy } = initAnalyser(mediaStream, fftSize);
    const dataArray = getDataArray();

    expect(resume).toBeDefined();
    expect(destroy).toBeDefined();
    expect(dataArray.length).toBe(fftSize);
  });

  it('should resume audio context', async () => {
    const mediaStream = new MediaStream([
      createAudioMediaStreamTrackMock() as unknown as MediaStreamTrack,
    ]);
    const { resume } = initAnalyser(mediaStream);

    await expect(resume()).resolves.toBeUndefined();
  });

  it('should destroy analyser and close audio context', async () => {
    const mediaStream = new MediaStream([
      createAudioMediaStreamTrackMock() as unknown as MediaStreamTrack,
    ]);
    const { destroy } = initAnalyser(mediaStream);

    await expect(destroy()).resolves.toBeUndefined();
  });

  it('should handle resume when audio context is null', async () => {
    const mediaStream = new MediaStream([
      createAudioMediaStreamTrackMock() as unknown as MediaStreamTrack,
    ]);
    const { resume, destroy } = initAnalyser(mediaStream);

    await destroy();
    await expect(resume()).resolves.toBeUndefined();
  });

  it('should handle destroy when audio context is already null', async () => {
    const mediaStream = new MediaStream([
      createAudioMediaStreamTrackMock() as unknown as MediaStreamTrack,
    ]);
    const { destroy } = initAnalyser(mediaStream);

    await destroy();
    await expect(destroy()).resolves.toBeUndefined();
  });
});
