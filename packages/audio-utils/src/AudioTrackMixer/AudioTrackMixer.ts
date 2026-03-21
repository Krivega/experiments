import AudioContext from '../AudioContext';

interface TrackCache {
  track: MediaStreamTrack;
  mediaStream: MediaStream;
  sourceNode: MediaStreamAudioSourceNode;
  gainNode: GainNode;
}

const BASE = 128;

export class AudioTrackMixer {
  private readonly audioContext: AudioContext;

  private readonly destinationNode: MediaStreamAudioDestinationNode;

  private readonly caches = new Map<string, TrackCache>();

  private readonly analyserSourceNode: MediaStreamAudioSourceNode;

  private readonly analyser: AnalyserNode;

  private readonly timeDomainData: Uint8Array<ArrayBuffer>;

  /**
   * Create an audio track mixer
   *
   * @returns An audio track mixer
   * @throws Throw an error if the browser does not support to mix audio track
   * @example
   * ```
   * const mixer = new AudioTrackMixer();
   * ```
   */
  public constructor() {
    this.audioContext = new AudioContext();

    // some browser may not support to mix audio track, such as Edge 18.xxx
    if (
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
      !this.audioContext.createMediaStreamDestination ||
      typeof this.audioContext.createMediaStreamDestination !== 'function'
    ) {
      throw new Error('the environment doesnot support to mix audio track');
    }

    this.destinationNode = this.audioContext.createMediaStreamDestination();

    const outStream = this.destinationNode.stream;

    this.analyserSourceNode = this.audioContext.createMediaStreamSource(outStream);
    this.analyser = this.audioContext.createAnalyser();
    this.timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyserSourceNode.connect(this.analyser);

    // hack - safari（desktop, mobile) 切换屏幕时，Audio
    this.audioContext.addEventListener('statechange', () => {
      if (this.audioContext.state === 'interrupted') {
        this.audioContext.resume().catch((error: unknown) => {
          // eslint-disable-next-line no-console
          console.error('resume audioContext error', error);
        });
      }
    });
  }

  /**
   * Add an audio track ([MediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack)) into the mixer.
   *
   * @param track - An audio track
   * @returns Return the mixer itself, so it support the chain invoke.
   * @throws Throw an error if the track is not an audio kind MediaStreamTrack or it has already been added.
   * @example
   * ```
   * mixer.addTrack(trackA);
   * mixer.addTrack(trackB);
   * ```
   *
   * @note Because of the chain invoke, you can also use it just like the following way:
   *
   * ```
   * mixer.addTrack(trackA).addTrack(trackB);
   * ```
   */
  public addTrack(track: MediaStreamTrack): this {
    if (!track.kind || track.kind !== 'audio') {
      throw new Error('not an audio track');
    }

    const cache: TrackCache | undefined = this.caches.get(track.id);

    if (cache) {
      throw new Error(`audio track (id: ${track.id}) has already been added`);
    }

    const mediaStream: MediaStream = new MediaStream();

    mediaStream.addTrack(track);

    const sourceNode: MediaStreamAudioSourceNode =
      this.audioContext.createMediaStreamSource(mediaStream);
    const gainNode: GainNode = this.audioContext.createGain();

    sourceNode.connect(gainNode);
    gainNode.connect(this.destinationNode);
    this.caches.set(track.id, {
      track,
      mediaStream,
      sourceNode,
      gainNode,
    });

    return this;
  }

  /**
   * Remove an audio track from the mixer.
   *
   * @param track - The audio track added into the mixer.
   * @returns Return the mixer itself to support the chain invoke.
   * @throws Throw an error if the track is not an audio kind MediaStreamTrack.
   * @example
   * ```
   * mixer.removeTrack(trackA);
   * mixer.removeTrack(trackB);
   * ```
   *
   * @note Because of the chain invoke, you can also use it just like the following way:
   *
   * ```
   * mixer.removeTrack(trackA).removeTrack(trackB);
   * ```
   */
  public removeTrack(track: MediaStreamTrack): this {
    if (!track.kind || track.kind !== 'audio') {
      throw new Error('not an audio track');
    }

    const cache: TrackCache | undefined = this.caches.get(track.id);

    if (cache) {
      cache.gainNode.disconnect(this.destinationNode);
      cache.sourceNode.disconnect(cache.gainNode);
      this.caches.delete(track.id);
    }

    return this;
  }

  /**
   * Set volume of the track added into the mixer.
   *
   * @param track - The track added into the mixer
   * @param volume - Volume range [0, 100]
   * @throws Throw an error if the track is not an audio kind MediaStreamTrack
   *
   * @example
   * ```
   * mixer.setTrackVolume(trackA, 50);
   * ```
   */
  public setTrackVolume(track: MediaStreamTrack, volume: number): void {
    if (!track.kind || track.kind !== 'audio') {
      throw new Error('not an audio track');
    }

    const cache: TrackCache | undefined = this.caches.get(track.id);

    if (cache) {
      cache.gainNode.gain.value = volume / 100;
    }
  }

  /**
   * Mute a track.
   *
   * @param track - The track added into the mixer
   * @returns True if mute successfully, False when failure
   * @throws Throw an error if the track is not an audio kind MediaStreamTrack
   *
   * @example
   * ```
   * const result = mixer.muteTrack(trackA);
   * ```
   */
  public muteTrack(track: MediaStreamTrack): boolean {
    if (!track.kind || track.kind !== 'audio') {
      throw new Error('not an audio track');
    }

    const cache: TrackCache | undefined = this.caches.get(track.id);

    if (cache) {
      cache.track.enabled = false;

      return true;
    }

    return false;
  }

  /**
   * Unmute the track added into the mixer.
   *
   * @param track - The track added into the mixer
   * @returns True if unmute successfully, False when failure
   * @throws Throw an error if the track is not an audio kind MediaStreamTrack
   *
   * @example
   * ```
   * const result = mixer.unmuteTrack(trackA);
   * ```
   */
  public unmuteTrack(track: MediaStreamTrack): boolean {
    if (!track.kind || track.kind !== 'audio') {
      throw new Error('not an audio track');
    }

    const cache: TrackCache | undefined = this.caches.get(track.id);

    if (cache) {
      cache.track.enabled = true;

      return true;
    }

    return false;
  }

  /**
   * Get all original tracksr (not the mixed one).
   *
   * @returns Return all original tracks
   * @example
   * ```
   * const tracks = mixer.getTracks();
   * ```
   */
  public getTracks(): MediaStreamTrack[] {
    const tracks: MediaStreamTrack[] = [];

    this.caches.forEach((cache: TrackCache) => {
      tracks.push(cache.track);
    });

    return tracks;
  }

  /**
   * Get the mixed track from the mixer after mixing tracks.
   *
   * @returns The mixed audio track
   * @example
   * ```
   * const mixedTrack = mixer.getMixedTrack();
   * ```
   */
  public getMixedTrack(): MediaStreamTrack {
    return this.destinationNode.stream.getAudioTracks()[0];
  }

  /**
   * Get the volume of the mixed track.
   *
   * @returns Volume range [0, 100]
   * @example
   * ```
   * const volume = mixer.getMixedTrackVolume();
   * ```
   */
  public getMixedTrackVolume(): number {
    let max = 0;

    this.analyser.getByteTimeDomainData(this.timeDomainData);
    this.timeDomainData.forEach((item) => {
      max = Math.max(max, Math.abs(item - BASE));
    });

    return Math.floor((max / BASE) * 100);
  }

  /**
   * Get media stream which contains mixed audio track, you can play it directly.
   *
   * @returns The media stream includes the mixed audio track
   * @example
   * ```
   * const audio = new Audio();
   * audio.srcObject = mixer.getMixedMediaStream();
   * ```
   */
  public getMixedMediaStream(): MediaStream {
    return this.destinationNode.stream;
  }

  /**
   * Clear cache of the mixer and destroy it.
   *
   * @returns An promise
   * @example
   * ```
   * mixer
   *  .destroy()
   *  .catch(err => {
   *    ...
   *  });
   * ```
   */
  public async destroy(): Promise<void> {
    this.caches.forEach((cache: TrackCache) => {
      cache.gainNode.disconnect(this.destinationNode);
      cache.sourceNode.disconnect(cache.gainNode);
    });
    this.caches.clear();

    return this.audioContext.close();
  }
}
