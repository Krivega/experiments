/// <reference types="jest" />
import { createAudioMediaStreamTrackMock } from 'webrtc-mock';

import MediaRecorderMock from '../__fixtures__/MediaRecorderMock';
import RecorderInPage from '../RecorderInPage';

const createMockAudioTrack = (): MediaStreamAudioTrack => {
  return createAudioMediaStreamTrackMock() as MediaStreamAudioTrack;
};

describe('RecorderInPage', () => {
  beforeEach(() => {
    MediaRecorderMock.reset();
    globalThis.MediaRecorder = MediaRecorderMock as unknown as typeof MediaRecorder;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('#1 should pass stream with the given audio track to MediaRecorder', () => {
    const track = createMockAudioTrack();

    // eslint-disable-next-line no-new
    new RecorderInPage(track);

    const [instance] = MediaRecorderMock.instances;

    expect(instance).toBeDefined();
    expect(instance.stream.getAudioTracks()).toEqual([track]);
  });

  it('#2 should pick first supported mime type from candidates', () => {
    MediaRecorderMock.isTypeSupported.mockImplementation((type) => {
      return type === 'audio/mp4';
    });

    const track = createMockAudioTrack();

    // eslint-disable-next-line no-new
    new RecorderInPage(track);

    const [instance] = MediaRecorderMock.instances;

    expect(instance.mimeType).toBe('audio/mp4');
  });

  it('#3 start should call MediaRecorder.start', () => {
    const track = createMockAudioTrack();
    const recorder = new RecorderInPage(track);
    const [instance] = MediaRecorderMock.instances;

    recorder.start();

    expect(instance.start).toHaveBeenCalledTimes(1);
  });

  it('#4 stop should resolve blob with recorder mime type when set', async () => {
    const track = createMockAudioTrack();
    const recorder = new RecorderInPage(track);

    recorder.start();

    const blob = await recorder.stop();

    expect(blob.type).toBe('audio/webm;codecs=opus');
    expect(blob.size).toBe(new Blob(['test-chunk']).size);
  });

  it('#5 stop should use picked mime type when recorder mimeType is empty string', async () => {
    const track = createMockAudioTrack();
    const recorder = new RecorderInPage(track);
    const [instance] = MediaRecorderMock.instances;

    Object.defineProperty(instance, 'mimeType', {
      configurable: true,
      get: () => {
        return '';
      },
    });

    recorder.start();

    const blob = await recorder.stop();

    expect(blob.type).toBe('audio/webm;codecs=opus');
  });

  it('#6 stop should fall back to audio/webm when no mime was picked and recorder mimeType is empty', async () => {
    MediaRecorderMock.isTypeSupported.mockReturnValue(false);

    const track = createMockAudioTrack();
    const recorder = new RecorderInPage(track);

    recorder.start();

    const blob = await recorder.stop();

    expect(blob.type).toBe('audio/webm');
  });

  it('#7 should ignore zero-size dataavailable chunks', async () => {
    const track = createMockAudioTrack();
    const recorder = new RecorderInPage(track);
    const [instance] = MediaRecorderMock.instances;

    instance.stop.mockImplementation(() => {
      const empty = new Event('dataavailable') as BlobEvent;

      Object.defineProperty(empty, 'data', {
        enumerable: true,
        value: new Blob([], { type: 'audio/webm' }),
      });
      instance.dispatchEvent(empty);

      const withData = new Event('dataavailable') as BlobEvent;

      Object.defineProperty(withData, 'data', { enumerable: true, value: new Blob(['x']) });
      instance.dispatchEvent(withData);
      instance.dispatchEvent(new Event('stop'));
    });

    recorder.start();

    const blob = await recorder.stop();

    expect(blob.size).toBe(1);
  });

  it('#8 stop should reject on MediaRecorder error', async () => {
    const track = createMockAudioTrack();
    const recorder = new RecorderInPage(track);
    const [instance] = MediaRecorderMock.instances;

    instance.stop.mockImplementation(() => {
      instance.dispatchEvent(new Event('error'));
    });

    recorder.start();

    await expect(recorder.stop()).rejects.toThrow('MediaRecorder error');
  });

  it('#9 start-stop-start should use a new MediaRecorder and fresh chunks', async () => {
    const track = createMockAudioTrack();
    const recorder = new RecorderInPage(track);

    recorder.start();

    const firstBlob = await recorder.stop();

    expect(MediaRecorderMock.instances).toHaveLength(1);

    recorder.start();

    expect(MediaRecorderMock.instances).toHaveLength(2);

    const [, secondInstance] = MediaRecorderMock.instances;

    expect(secondInstance.start).toHaveBeenCalledTimes(1);

    const secondBlob = await recorder.stop();

    expect(secondBlob.size).toBe(firstBlob.size);
    expect(new Blob([firstBlob, secondBlob]).size).toBe(firstBlob.size * 2);
  });
});
