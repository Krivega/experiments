/* eslint-disable @typescript-eslint/no-magic-numbers */

import type TRnnoise from './rnnoise';

/**
 * Constant. Rnnoise default sample size, samples of different size won't work.
 */
export const RNNOISE_SAMPLE_LENGTH = 480;

/**
 *  Constant. Rnnoise only takes inputs of 480 PCM float32 samples thus 480*4.
 */
const RNNOISE_BUFFER_SIZE: number = RNNOISE_SAMPLE_LENGTH * 4;

/**
 *  Constant. Rnnoise only takes operates on 44.1Khz float 32 little endian PCM.
 */
const PCM_FREQUENCY = 44_100;

/**
 * Used to shift a 32 bit number by 16 bits.
 */
const SHIFT_16_BIT_NR = 32_768;

/**
 * Represents an adaptor for the rnnoise library compiled to webassembly. The class takes care of webassembly
 * memory management and exposes rnnoise functionality such as PCM audio denoising and VAD (voice activity
 * detection) scores.
 */
export default class RnnoiseProcessor {
  /**
   * Rnnoise context object needed to perform the audio processing.
   */
  private readonly context: number;

  /**
   * State flag, check if the instance was destroyed.
   */
  private destroyed = false;

  /**
   * WASM interface through which calls to rnnoise are made.
   */
  private readonly wasmInterface: TRnnoise;

  /**
   * WASM dynamic memory buffer used as input for rnnoise processing method.
   */
  private readonly wasmPcmInput: number;

  /**
   * The Float32Array index representing the start point in the wasm heap of the wasmPcmInput buffer.
   */
  private readonly wasmPcmInputF32Index: number;

  /**
   * Constructor.
   *
   * @class
   * @param {Object} wasmInterface - WebAssembly module interface that exposes rnnoise functionality.
   */
  public constructor(wasmInterface: TRnnoise) {
    // Considering that we deal with dynamic allocated memory employ exception safety strong guarantee
    // i.e. in case of exception there are no side effects.
    try {
      this.wasmInterface = wasmInterface;

      // For VAD score purposes only allocate the buffers once and reuse them
      this.wasmPcmInput = this.wasmInterface.malloc(RNNOISE_BUFFER_SIZE);

      // eslint-disable-next-line no-bitwise
      this.wasmPcmInputF32Index = this.wasmPcmInput >> 2;

      if (!this.wasmPcmInput) {
        throw new Error('Failed to create wasm input memory buffer!');
      }

      this.context = this.wasmInterface.rnnoiseCreate();
    } catch (error) {
      // release can be called even if not all the components were initialized.
      this.destroy();
      throw error;
    }
  }

  /**
   * Rnnoise can only operate on a certain PCM array size.
   *
   * @returns {number} - The PCM sample array size as required by rnnoise.
   */
  public static getSampleLength(): number {
    return RNNOISE_SAMPLE_LENGTH;
  }

  /**
   * Rnnoise can only operate on a certain format of PCM sample namely float 32 44.1Kz.
   *
   * @returns {number} - PCM sample frequency as required by rnnoise.
   */
  public static getRequiredPCMFrequency(): number {
    return PCM_FREQUENCY;
  }

  /**
   * Release any resources required by the rnnoise context this needs to be called
   * before destroying any context that uses the processor.
   *
   * @returns {void}
   */
  public destroy(): void {
    // Attempting to release a non initialized processor, do nothing.
    if (this.destroyed) {
      return;
    }

    this.releaseWasmResources();

    this.destroyed = true;
  }

  /**
   * Calculate the Voice Activity Detection for a raw Float32 PCM sample Array.
   * The size of the array must be of exactly 480 samples, this constraint comes from the rnnoise library.
   *
   * @param {Float32Array} pcmFrame - Array containing 32 bit PCM samples.
   * @returns {Float} Contains VAD score in the interval 0 - 1 i.e. 0.90.
   */
  public calculateAudioFrameVAD(pcmFrame: Float32Array): number {
    return this.processAudioFrame(pcmFrame);
  }

  /**
   * Process an audio frame, optionally denoising the input pcmFrame and returning the Voice Activity Detection score
   * for a raw Float32 PCM sample Array.
   * The size of the array must be of exactly 480 samples, this constraint comes from the rnnoise library.
   *
   * @param {Float32Array} pcmFrame - Array containing 32 bit PCM samples. Parameter is also used as output
   * when {@code shouldDenoise} is true.
   * @param {boolean} shouldDenoise - Should the denoised frame be returned in pcmFrame.
   * @returns {Float} Contains VAD score in the interval 0 - 1 i.e. 0.90 .
   */
  public processAudioFrame(pcmFrame: Float32Array, shouldDenoise = false): number {
    // Convert 32 bit Float PCM samples to 16 bit Float PCM samples as that's what rnnoise accepts as input
    for (let index = 0; index < RNNOISE_SAMPLE_LENGTH; index++) {
      this.wasmInterface.HEAPF32[this.wasmPcmInputF32Index + index] =
        pcmFrame[index] * SHIFT_16_BIT_NR;
    }

    // Use the same buffer for input/output, rnnoise supports this behavior
    const vadScore = this.wasmInterface.rnnoiseProcessFrame(
      this.context,
      this.wasmPcmInput,
      this.wasmPcmInput,
    );

    // Rnnoise denoises the frame by default but we can avoid unnecessary operations if the calling
    // client doesn't use the denoised frame.
    if (shouldDenoise) {
      // Convert back to 32 bit PCM
      for (let index = 0; index < RNNOISE_SAMPLE_LENGTH; index++) {
        // eslint-disable-next-line no-param-reassign
        pcmFrame[index] =
          this.wasmInterface.HEAPF32[this.wasmPcmInputF32Index + index] / SHIFT_16_BIT_NR;
      }
    }

    return vadScore;
  }

  /**
   * Release resources associated with the wasm context. If something goes downhill here
   * i.e. Exception is thrown, there is nothing much we can do.
   *
   * @returns {void}
   */
  private releaseWasmResources(): void {
    // For VAD score purposes only allocate the buffers once and reuse them
    if (this.wasmPcmInput) {
      this.wasmInterface.free(this.wasmPcmInput);
    }

    if (this.context) {
      this.wasmInterface.rnnoiseDestroy(this.context);
    }
  }
}
