import { AudioContext } from 'standardized-audio-context-mock';
import { createAudioContextAudioMediaStreamTrackMock } from 'webrtc-mock';

declare let global: {
  isRunningAudioContextStateByDefault: boolean;
};

class AudioContextMock extends AudioContext {
  public constructor(options?: {
    latencyHint?: number | 'balanced' | 'interactive' | 'playback';
    sampleRate?: number;
  }) {
    super(options);

    if (global.isRunningAudioContextStateByDefault) {
      // @ts-expect-error
      // eslint-disable-next-line no-underscore-dangle
      this._state = 'running';
    }
  }

  public createAnalyser() {
    const analyser = super.createAnalyser();

    return {
      ...analyser,
      getByteFrequencyData() {},
      get frequencyBinCount(): number {
        return this.fftSize;
      },
    };
  }

  // @ts-expect-error
  public createMediaStreamSource(mediaStream: MediaStream): MediaStreamAudioSourceNode {
    const mediaStreamSource = super.createMediaStreamSource(mediaStream);

    return {
      ...mediaStreamSource,
      // @ts-expect-error
      connect: () => {},
      disconnect: () => {},
    };
  }

  // public createMediaStreamTrackSource() {
  //   const mediaStreamTrackSource = super.createMediaStreamTrackSource();

  //   return {
  //     ...mediaStreamTrackSource,
  //     connect: () => {},
  //     disconnect: () => {},
  //   };
  // }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  public createScriptProcessor(): ScriptProcessorNode {
    return {
      bufferSize: 0,
      // eslint-disable-next-line unicorn/no-null
      onaudioprocess: null,
      addEventListener(): void {},
      removeEventListener(): void {},
      channelCount: 0,
      channelCountMode: 'clamped-max',
      channelInterpretation: 'discrete',
      numberOfInputs: 0,
      numberOfOutputs: 0,
      // @ts-expect-error
      connect() {},
      disconnect(): void {},
      // @ts-expect-error
      dispatchEvent(): boolean {},
    };
  }

  // @ts-expect-error
  public createMediaStreamDestination(): MediaStreamAudioDestinationNode {
    const mediaStreamDestination = super.createMediaStreamDestination();
    const { stream } = mediaStreamDestination;

    stream.addTrack(createAudioContextAudioMediaStreamTrackMock());

    // @ts-expect-error
    return { ...mediaStreamDestination, stream };
  }

  public async resume(): Promise<void> {
    return super.resume().then(() => {
      this.dispatchEvent(new Event('statechange'));
    });
  }

  public async suspend(): Promise<void> {
    return super.suspend().then(() => {
      this.dispatchEvent(new Event('statechange'));
    });
  }

  public async close(): Promise<void> {
    return super.close().then(() => {
      this.dispatchEvent(new Event('statechange'));
    });
  }
}

export default AudioContextMock;
