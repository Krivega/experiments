import logger from './logger';

export interface NoiseSuppressionEffectBaseOptions {
  audioContextOptions?: AudioContextOptions;
  processorName: string;
  onAudioContextCreated?: (audioContext: AudioContext) => void;
  onProcessorMessage?: (message: unknown) => void;
}

export abstract class NoiseSuppressionEffectBase {
  private audioContext?: AudioContext;

  private audioSource?: MediaStreamAudioSourceNode;

  private audioDestination?: MediaStreamAudioDestinationNode;

  private noiseSuppressorNode?: AudioWorkletNode;

  private readonly workletUrl: string;

  private readonly processorName: string;

  private readonly audioContextOptions?: AudioContextOptions;

  private readonly onAudioContextCreated?: (audioContext: AudioContext) => void;

  private readonly onProcessorMessage?: (message: unknown) => void;

  protected constructor(workletUrl: string, options: NoiseSuppressionEffectBaseOptions) {
    this.workletUrl = workletUrl;
    this.processorName = options.processorName;
    this.audioContextOptions = options.audioContextOptions;
    this.onAudioContextCreated = options.onAudioContextCreated;
    this.onProcessorMessage = options.onProcessorMessage;
  }

  private static shouldLogProcessorMessage(
    message: unknown,
  ): message is { type: 'warning' | 'error'; message?: string } {
    if (typeof message !== 'object' || message === null || !('type' in message)) {
      return false;
    }

    return message.type === 'warning' || message.type === 'error';
  }

  public startEffect = async (
    audioTrack: MediaStreamAudioTrack,
  ): Promise<MediaStreamAudioTrack> => {
    const audioContext = new AudioContext(this.audioContextOptions);
    const audioSource = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
    const audioDestination = audioContext.createMediaStreamDestination();

    this.audioContext = audioContext;
    this.audioSource = audioSource;
    this.audioDestination = audioDestination;
    this.onAudioContextCreated?.(audioContext);

    // eslint-disable-next-line no-param-reassign
    audioTrack.enabled = true;

    try {
      await audioContext.audioWorklet.addModule(this.workletUrl);

      this.noiseSuppressorNode = new AudioWorkletNode(audioContext, this.processorName);
      this.noiseSuppressorNode.port.addEventListener(
        'message',
        ({ data }: MessageEvent<unknown>) => {
          if (NoiseSuppressionEffectBase.shouldLogProcessorMessage(data)) {
            logger('Noise suppressor worklet reported an issue', {
              processorName: this.processorName,
              message: data,
            });
          }

          this.onProcessorMessage?.(data);
        },
      );
      this.noiseSuppressorNode.port.start();

      audioSource.connect(this.noiseSuppressorNode).connect(audioDestination);
    } catch (error: unknown) {
      logger('Error while starting noise suppression effect', {
        processorName: this.processorName,
        error,
      });
      await audioContext.close();
      this.audioContext = undefined;
      this.audioSource = undefined;
      this.audioDestination = undefined;
      throw error;
    }

    const [outputMediaTrack] = audioDestination.stream.getAudioTracks();

    return outputMediaTrack;
  };

  public stopEffect = async () => {
    this.noiseSuppressorNode?.port.postMessage({ type: 'destroy' });
    this.noiseSuppressorNode?.port.close();
    this.audioDestination?.disconnect();
    this.noiseSuppressorNode?.disconnect();
    this.audioSource?.disconnect();
    await this.audioContext?.close();
    delete this.noiseSuppressorNode;
    delete this.audioDestination;
    delete this.audioSource;
    delete this.audioContext;
  };
}
