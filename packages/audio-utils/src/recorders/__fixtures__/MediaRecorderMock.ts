const createBlobEvent = (type: string, data: Blob): BlobEvent => {
  const event = new Event(type) as BlobEvent;

  Object.defineProperty(event, 'data', { enumerable: true, value: data });

  return event;
};

export default class MediaRecorderMock extends EventTarget {
  public static instances: MediaRecorderMock[] = [];

  public static isTypeSupported = jest.fn((mimeType: string) => {
    return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].includes(mimeType);
  });

  public mimeType: string;

  public readonly stream: MediaStream;

  public readonly start = jest.fn();

  public stop = jest.fn(() => {
    this.finish(true);
  });

  public constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    super();
    this.stream = stream;
    this.mimeType = options?.mimeType ?? '';
    MediaRecorderMock.instances.push(this);
  }

  public static reset() {
    MediaRecorderMock.instances = [];
    MediaRecorderMock.isTypeSupported.mockImplementation((mimeType: string) => {
      return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].includes(mimeType);
    });
  }

  public finish(success = true) {
    if (success) {
      const data = new Blob(['test-chunk'], { type: this.mimeType || 'application/octet-stream' });

      this.dispatchEvent(createBlobEvent('dataavailable', data));
      this.dispatchEvent(new Event('stop'));
    } else {
      this.dispatchEvent(new Event('error'));
    }
  }
}
