import logger from './logger';

class NoiseSuppressionEffect {
  /**
   * Web audio context.
   */
  private audioContext?: AudioContext;

  /**
   * Source that will be attached to the track affected by the effect.
   */
  private audioSource?: MediaStreamAudioSourceNode;

  /**
   * Destination that will contain denoised audio from the audio worklet.
   */
  private audioDestination?: MediaStreamAudioDestinationNode;

  /**
   * `AudioWorkletProcessor` associated node.
   */
  private noiseSuppressorNode?: AudioWorkletNode;

  private readonly workletUrl: string;

  public constructor(workletUrl: string) {
    this.workletUrl = workletUrl;
  }

  /**
   * Effect interface called by source audioTrack.
   * Applies effect that uses a {@code NoiseSuppressor} service initialized with {@code RnnoiseProcessor}
   * for denoising.
   *
   * @param {MediaStream} audioTrack - Audio stream which will be mixed with _mixAudio.
   * @returns {MediaStream} - MediaStream containing both audio tracks mixed together.
   */
  public startEffect = (audioTrack: MediaStreamAudioTrack): MediaStreamAudioTrack => {
    logger('startEffect');

    const audioContext = new AudioContext();

    this.audioContext = audioContext;

    const audioSource = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));

    this.audioSource = audioSource;

    const audioDestination = audioContext.createMediaStreamDestination();

    this.audioDestination = audioDestination;

    const outputMediaTrack = this.audioDestination.stream.getAudioTracks()[0];

    // Connect the audio processing graph MediaStream -> AudioWorkletNode -> MediaStreamAudioDestinationNode
    audioContext.audioWorklet
      .addModule(this.workletUrl)
      .then(() => {
        // After the resolution of module loading, an AudioWorkletNode can be constructed.
        this.noiseSuppressorNode = new AudioWorkletNode(audioContext, 'NoiseSuppressorWorklet');
        audioSource.connect(this.noiseSuppressorNode).connect(audioDestination);
      })
      .then(() => {
        logger('Success!!!');
      })
      .catch((error) => {
        logger('Error while adding audio worklet module: ', error);
      });

    // We enable the audio on the original track because mute/unmute action will only affect the audio destination
    // output track from this point on.
    // eslint-disable-next-line no-param-reassign
    audioTrack.enabled = true;

    return outputMediaTrack;
  };

  public stopEffect = async () => {
    logger('stopEffect');
    // Technically after this process the Audio Worklet along with it's resources should be garbage collected,
    // however on chrome there seems to be a problem as described here:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1298955
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

export default NoiseSuppressionEffect;
