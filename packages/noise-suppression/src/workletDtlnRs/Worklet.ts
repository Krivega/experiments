import initDTLN from './dtln';

import type { DtlnModule } from './dtln';

type TProcessorDetails = Record<string, boolean | number | string>;

type TProcessorMessage =
  | { type: 'ready' }
  | { type: 'warning'; message: string; details?: TProcessorDetails }
  | { type: 'error'; message: string; details?: TProcessorDetails };

const DTLN_FRAME_SIZE = 512;
const DTLN_REQUIRED_SAMPLE_RATE = 16_000;
const DTLN_BUFFER_CAPACITY = DTLN_FRAME_SIZE * 32;
const DTLN_INIT_TIMEOUT_MS = 5000;

const dtlnModulePromise: Promise<DtlnModule> = initDTLN();

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function getFirstChannel(channels: Float32Array[][]): Float32Array | undefined {
  if (channels.length === 0) {
    return undefined;
  }

  const firstInput = channels[0];

  if (firstInput.length === 0) {
    return undefined;
  }

  const firstChannel = firstInput[0];

  return firstChannel;
}

function getOutputChannels(channels: Float32Array[][]): Float32Array[] | undefined {
  if (channels.length === 0) {
    return undefined;
  }

  const firstOutput = channels[0];

  if (firstOutput.length === 0) {
    return undefined;
  }

  return firstOutput;
}

function fillAllOutputChannels(outputChannels: Float32Array[], source: Float32Array): void {
  for (const outputChannel of outputChannels) {
    outputChannel.set(source);
  }
}

function silenceAllOutputChannels(outputChannels: Float32Array[]): void {
  for (const outputChannel of outputChannels) {
    outputChannel.fill(0);
  }
}

function writeToRingBuffer(
  ringBuffer: Float32Array,
  writeIndex: number,
  source: Float32Array,
): void {
  const firstChunkLength = Math.min(source.length, ringBuffer.length - writeIndex);

  ringBuffer.set(source.subarray(0, firstChunkLength), writeIndex);

  const remainingLength = source.length - firstChunkLength;

  if (remainingLength > 0) {
    ringBuffer.set(source.subarray(firstChunkLength, firstChunkLength + remainingLength), 0);
  }
}

function readFromRingBuffer(
  ringBuffer: Float32Array,
  readIndex: number,
  target: Float32Array,
): void {
  const firstChunkLength = Math.min(target.length, ringBuffer.length - readIndex);

  target.set(ringBuffer.subarray(readIndex, readIndex + firstChunkLength), 0);

  const remainingLength = target.length - firstChunkLength;

  if (remainingLength > 0) {
    target.set(ringBuffer.subarray(0, remainingLength), firstChunkLength);
  }
}

function advanceRingIndex(index: number, consumedLength: number): number {
  return (index + consumedLength) % DTLN_BUFFER_CAPACITY;
}

class Worklet extends AudioWorkletProcessor {
  private dtlnModule?: DtlnModule;

  private handle?: number;

  private isReady = false;

  private initError?: unknown;

  private processing = false;

  private destroyed = false;

  private hasPostedError = false;

  private hasPostedSampleRateWarning = false;

  private hasPostedBackpressureWarning = false;

  private hasPostedInitTimeoutWarning = false;

  private initStartedAt = 0;

  private readonly inputFrame = new Float32Array(DTLN_FRAME_SIZE);

  private inputFrameLength = 0;

  private readonly processingInputFrame = new Float32Array(DTLN_FRAME_SIZE);

  private readonly processingOutputFrame = new Float32Array(DTLN_FRAME_SIZE);

  private readonly inputRingBuffer = new Float32Array(DTLN_BUFFER_CAPACITY);

  private inputReadIndex = 0;

  private inputWriteIndex = 0;

  private queuedInputSamples = 0;

  private readonly outputRingBuffer = new Float32Array(DTLN_BUFFER_CAPACITY);

  private outputReadIndex = 0;

  private outputWriteIndex = 0;

  private queuedOutputSamples = 0;

  private processedFrameCount = 0;

  private inputDroppedFrameCount = 0;

  private outputDroppedFrameCount = 0;

  public constructor() {
    super();

    this.port.addEventListener('message', (event: MessageEvent<{ type?: string }>) => {
      if (event.data.type === 'destroy') {
        this.destroy();
      }
    });
    this.port.start();

    if (sampleRate !== DTLN_REQUIRED_SAMPLE_RATE) {
      this.postWarningOnce(
        `DTLN expects ${DTLN_REQUIRED_SAMPLE_RATE} Hz mono input, received ${sampleRate} Hz. Falling back to passthrough.`,
        {
          expectedSampleRate: DTLN_REQUIRED_SAMPLE_RATE,
          actualSampleRate: sampleRate,
        },
      );

      return;
    }

    this.initialize();
  }

  public process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const input = getFirstChannel(inputs);
    const outputChannels = getOutputChannels(outputs);

    if (outputChannels === undefined) {
      return true;
    }

    const [output] = outputChannels;

    if (input === undefined) {
      silenceAllOutputChannels(outputChannels);

      return true;
    }

    if (sampleRate !== DTLN_REQUIRED_SAMPLE_RATE || this.initError !== undefined) {
      fillAllOutputChannels(outputChannels, input);

      return true;
    }

    if (!this.isReady) {
      this.postInitTimeoutWarningIfNeeded();

      fillAllOutputChannels(outputChannels, input);

      return true;
    }

    this.enqueueInput(input);
    this.scheduleDenoise();
    this.dequeueOutput(output, input);

    for (const outputChannel of outputChannels.slice(1)) {
      outputChannel.set(output);
    }

    return true;
  }

  private initialize(): void {
    this.initStartedAt = Date.now();

    const initializationPromise = (async () => {
      this.dtlnModule = await dtlnModulePromise;

      if (this.destroyed) {
        return;
      }

      const handle = await this.dtlnModule.dtln_create();

      this.handle = handle;
      this.isReady = true;
      this.postMessage({ type: 'ready' });
      this.scheduleDenoise();
    })();

    initializationPromise.catch((error: unknown) => {
      this.initError = error;
      this.postErrorOnce(`DTLN init failed: ${getErrorMessage(error)}`, {
        errorMessage: getErrorMessage(error),
        initElapsedMs: Date.now() - this.initStartedAt,
      });
    });
  }

  private enqueueInput(input: Float32Array): void {
    let inputOffset = 0;

    while (inputOffset < input.length) {
      const writableSamples = Math.min(
        DTLN_FRAME_SIZE - this.inputFrameLength,
        input.length - inputOffset,
      );

      this.inputFrame.set(
        input.subarray(inputOffset, inputOffset + writableSamples),
        this.inputFrameLength,
      );
      this.inputFrameLength += writableSamples;
      inputOffset += writableSamples;

      if (this.inputFrameLength === DTLN_FRAME_SIZE) {
        const wasQueued = this.enqueueFrame(this.inputFrame);

        if (!wasQueued) {
          this.inputDroppedFrameCount += 1;
          this.postBackpressureWarningOnce(
            'DTLN processing is overloaded. Dropping buffered audio frames.',
            {
              droppedInputFrames: this.inputDroppedFrameCount,
              queuedInputSamples: this.queuedInputSamples,
              bufferCapacity: DTLN_BUFFER_CAPACITY,
            },
          );
        }

        this.inputFrameLength = 0;
      }
    }
  }

  private scheduleDenoise(): void {
    if (
      !this.isReady ||
      this.processing ||
      this.dtlnModule === undefined ||
      this.handle === undefined
    ) {
      return;
    }

    if (this.queuedInputSamples < DTLN_FRAME_SIZE) {
      return;
    }

    this.dequeueFrame(this.processingInputFrame);

    this.processing = true;

    const denoisePromise = this.dtlnModule.dtln_denoise(
      this.handle,
      this.processingInputFrame,
      this.processingOutputFrame,
    );

    denoisePromise
      .then(() => {
        if (this.destroyed) {
          return;
        }

        this.processedFrameCount += 1;

        const wasQueued = this.enqueueProcessedOutput(this.processingOutputFrame);

        if (!wasQueued) {
          this.outputDroppedFrameCount += 1;
          this.postBackpressureWarningOnce(
            'DTLN output buffer is full. Dropping processed audio frames.',
            {
              droppedOutputFrames: this.outputDroppedFrameCount,
              queuedOutputSamples: this.queuedOutputSamples,
              bufferCapacity: DTLN_BUFFER_CAPACITY,
            },
          );
        }
      })
      .catch((error: unknown) => {
        this.initError = error;
        this.postErrorOnce(`DTLN processing failed: ${getErrorMessage(error)}`, {
          errorMessage: getErrorMessage(error),
          processedFrameCount: this.processedFrameCount,
          queuedInputSamples: this.queuedInputSamples,
          queuedOutputSamples: this.queuedOutputSamples,
        });
      })
      .finally(() => {
        this.processing = false;
        this.scheduleDenoise();
      });
  }

  private dequeueOutput(output: Float32Array, fallbackInput: Float32Array): void {
    if (this.queuedOutputSamples < output.length) {
      output.set(fallbackInput);

      return;
    }

    readFromRingBuffer(this.outputRingBuffer, this.outputReadIndex, output);
    this.outputReadIndex = advanceRingIndex(this.outputReadIndex, output.length);
    this.queuedOutputSamples -= output.length;
  }

  private destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.isReady = false;
    this.queuedInputSamples = 0;
    this.queuedOutputSamples = 0;
    this.inputFrameLength = 0;

    if (this.dtlnModule !== undefined && this.handle !== undefined) {
      const { handle } = this;

      this.handle = undefined;

      const destroyPromise = this.dtlnModule.dtln_destroy(handle);

      destroyPromise.catch(() => {});
    }
  }

  private postMessage(message: TProcessorMessage): void {
    this.port.postMessage(message);
  }

  private postWarningOnce(message: string, details?: TProcessorDetails): void {
    if (this.hasPostedSampleRateWarning) {
      return;
    }

    this.hasPostedSampleRateWarning = true;
    this.postMessage({ type: 'warning', message, details });
  }

  private postErrorOnce(message: string, details?: TProcessorDetails): void {
    if (this.hasPostedError) {
      return;
    }

    this.hasPostedError = true;
    this.postMessage({ type: 'error', message, details });
  }

  private postBackpressureWarningOnce(message: string, details?: TProcessorDetails): void {
    if (this.hasPostedBackpressureWarning) {
      return;
    }

    this.hasPostedBackpressureWarning = true;
    this.postMessage({ type: 'warning', message, details });
  }

  private postInitTimeoutWarningIfNeeded(): void {
    if (this.hasPostedInitTimeoutWarning || this.initStartedAt === 0) {
      return;
    }

    const initElapsedMs = Date.now() - this.initStartedAt;

    if (initElapsedMs < DTLN_INIT_TIMEOUT_MS) {
      return;
    }

    this.hasPostedInitTimeoutWarning = true;
    this.postWarningOnce('DTLN initialization is taking too long.', {
      initElapsedMs,
      timeoutMs: DTLN_INIT_TIMEOUT_MS,
    });
  }

  private enqueueFrame(frame: Float32Array): boolean {
    if (this.queuedInputSamples + frame.length > this.inputRingBuffer.length) {
      return false;
    }

    writeToRingBuffer(this.inputRingBuffer, this.inputWriteIndex, frame);
    this.inputWriteIndex = advanceRingIndex(this.inputWriteIndex, frame.length);
    this.queuedInputSamples += frame.length;

    return true;
  }

  private dequeueFrame(target: Float32Array): void {
    readFromRingBuffer(this.inputRingBuffer, this.inputReadIndex, target);
    this.inputReadIndex = advanceRingIndex(this.inputReadIndex, target.length);
    this.queuedInputSamples -= target.length;
  }

  private enqueueProcessedOutput(frame: Float32Array): boolean {
    if (this.queuedOutputSamples + frame.length > this.outputRingBuffer.length) {
      return false;
    }

    writeToRingBuffer(this.outputRingBuffer, this.outputWriteIndex, frame);
    this.outputWriteIndex = advanceRingIndex(this.outputWriteIndex, frame.length);
    this.queuedOutputSamples += frame.length;

    return true;
  }
}

export default Worklet;
