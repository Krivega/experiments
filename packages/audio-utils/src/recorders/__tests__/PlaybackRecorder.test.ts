/// <reference types="jest" />
import { createAudioMediaStreamTrackMock } from 'webrtc-mock';

import MediaRecorderMock from '../__fixtures__/MediaRecorderMock';
import PlaybackRecorder from '../PlaybackRecorder';

const createMockAudioTrack = (): MediaStreamAudioTrack => {
  return createAudioMediaStreamTrackMock() as MediaStreamAudioTrack;
};

describe('PlaybackRecorder', () => {
  let createObjectURLMock: jest.Mock;
  let revokeObjectURLMock: jest.Mock;

  beforeEach(() => {
    MediaRecorderMock.reset();
    globalThis.MediaRecorder = MediaRecorderMock as unknown as typeof MediaRecorder;
    createObjectURLMock = jest.fn(() => {
      return 'blob:mock-url';
    });
    revokeObjectURLMock = jest.fn();
    Object.assign(URL, {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('#1 assignPlaybackFromBlob should revoke previous url, create object url and set playback src', () => {
    const playback = document.createElement('audio');
    const recorder = new PlaybackRecorder(playback);
    const blob = new Blob(['a'], { type: 'audio/webm' });

    recorder.assignPlaybackFromBlob(blob);

    expect(createObjectURLMock).toHaveBeenCalledWith(blob);
    expect(playback.getAttribute('src')).toBe('blob:mock-url');

    const secondBlob = new Blob(['b'], { type: 'audio/webm' });

    recorder.assignPlaybackFromBlob(secondBlob);

    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    expect(createObjectURLMock).toHaveBeenLastCalledWith(secondBlob);
  });

  it('#2 clearPlaybackUrl should revoke object url and remove playback src', () => {
    const playback = document.createElement('audio');
    const recorder = new PlaybackRecorder(playback);

    recorder.assignPlaybackFromBlob(new Blob(['x']));
    recorder.clearPlaybackUrl();

    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    expect(playback.hasAttribute('src')).toBe(false);
  });

  it('#3 clearPlaybackUrl should be safe when no url was assigned', () => {
    const playback = document.createElement('audio');
    const recorder = new PlaybackRecorder(playback);

    recorder.clearPlaybackUrl();

    expect(revokeObjectURLMock).not.toHaveBeenCalled();
    expect(playback.hasAttribute('src')).toBe(false);
  });

  it('#4 startRecording should start underlying MediaRecorder', () => {
    const playback = document.createElement('audio');
    const recorder = new PlaybackRecorder(playback);
    const track = createMockAudioTrack();

    recorder.startRecording(track);

    const [instance] = MediaRecorderMock.instances;

    expect(instance.stream.getAudioTracks()).toEqual([track]);
    expect(instance.start).toHaveBeenCalledTimes(1);
  });

  it('#5 stopRecordingAndAssignPlayback should assign blob to playback and clear recorder', async () => {
    const playback = document.createElement('audio');
    const recorder = new PlaybackRecorder(playback);
    const track = createMockAudioTrack();

    recorder.startRecording(track);
    await recorder.stopRecordingAndAssignPlayback();

    expect(playback.getAttribute('src')).toBe('blob:mock-url');
    expect(createObjectURLMock).toHaveBeenCalled();

    await recorder.stopRecordingAndAssignPlayback();

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
  });
});
