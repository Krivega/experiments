const pickMimeTypeForRecorder = (): string | undefined => {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return undefined;
};

export default class RecorderInPage {
  private readonly stream: MediaStream;

  private mediaRecorder: MediaRecorder;

  private readonly mimeType: string | undefined;

  private readonly chunks: BlobPart[] = [];

  private stopPromise?: Promise<Blob>;

  private needsNewMediaRecorderBeforeStart = false;

  public constructor(audioTrack: MediaStreamAudioTrack) {
    this.stream = new MediaStream([audioTrack]);
    this.mimeType = pickMimeTypeForRecorder();
    this.mediaRecorder = this.createMediaRecorder();
    this.attachDataAvailableHandler();
  }

  public start = () => {
    if (this.needsNewMediaRecorderBeforeStart) {
      this.needsNewMediaRecorderBeforeStart = false;
      this.replaceMediaRecorderForNextSession();
    }

    this.mediaRecorder.start();
  };

  public stop = async (): Promise<Blob> => {
    if (this.stopPromise !== undefined) {
      return this.stopPromise;
    }

    this.stopPromise = new Promise<Blob>((resolve, reject) => {
      const onStop = () => {
        this.needsNewMediaRecorderBeforeStart = true;

        const fromRecorder = this.mediaRecorder.mimeType;
        const blobType = fromRecorder === '' ? (this.mimeType ?? 'audio/webm') : fromRecorder;

        resolve(new Blob(this.chunks, { type: blobType }));
      };

      this.mediaRecorder.addEventListener('stop', onStop, { once: true });
      this.mediaRecorder.addEventListener(
        'error',
        () => {
          this.needsNewMediaRecorderBeforeStart = true;
          reject(new Error('MediaRecorder error'));
        },
        { once: true },
      );
      this.mediaRecorder.stop();
    });

    return this.stopPromise;
  };

  private createMediaRecorder(): MediaRecorder {
    return new MediaRecorder(
      this.stream,
      this.mimeType === undefined ? undefined : { mimeType: this.mimeType },
    );
  }

  private attachDataAvailableHandler(): void {
    this.mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    });
  }

  private replaceMediaRecorderForNextSession(): void {
    this.chunks.length = 0;
    this.stopPromise = undefined;
    this.mediaRecorder = this.createMediaRecorder();
    this.attachDataAvailableHandler();
  }
}
