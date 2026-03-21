import AudioContext from '../AudioContext';
import { AudioTrackMixer } from '../AudioTrackMixer';
import logger from '../logger';
import getAudioTrackFromDestination from './getAudioTrackFromDestination';

const loggerAudioProcessor = logger.extend('AudioProcessor');

const waitUserInteraction = async (): Promise<void> => {
  return new Promise<void>((resolve) => {
    const handle = () => {
      resolve();
    };
    const options = { once: true, passive: true };

    document.body.addEventListener('click', handle, options);
    document.body.addEventListener('keydown', handle, options);
  });
};

const resumeAudioContext = (audioContext: AudioContext) => {
  loggerAudioProcessor('resumeAudioContext');

  audioContext
    .resume()
    .then(() => {
      loggerAudioProcessor('resumeAudioContext success');
    })
    .catch((error: unknown) => {
      loggerAudioProcessor('resumeAudioContext error', error);
    });
};

class AudioProcessor {
  private readonly tracks: Map<string, MediaStreamAudioTrack> = new Map<
    string,
    MediaStreamAudioTrack
  >();

  private readonly idsMutedTracks: Map<string, string> = new Map<string, string>();

  private readonly mixer: AudioTrackMixer;

  private readonly audioContext: AudioContext;

  private readonly mediaStreamDestination: MediaStreamAudioDestinationNode;

  public constructor() {
    this.audioContext = new AudioContext();

    this.mediaStreamDestination = this.audioContext.createMediaStreamDestination();

    const audioTrack = getAudioTrackFromDestination(this.mediaStreamDestination);

    this.mixer = new AudioTrackMixer();

    this.initAudioContext();
    this.mixer.addTrack(audioTrack);
  }

  private get mixerAudioContext(): AudioContext {
    // @ts-expect-error
    return this.mixer.audioContext as AudioContext;
  }

  private get isSuspended(): boolean {
    return this.audioContext.state === 'suspended';
  }

  private get isSuspendedMixer(): boolean {
    return this.mixerAudioContext.state === 'suspended';
  }

  public addProcessor(
    processor: (parameters: {
      audioContext: AudioContext;
      mediaStreamDestination: MediaStreamAudioDestinationNode;
    }) => void,
  ) {
    loggerAudioProcessor('addProcessor: %o', {
      stateAudioContext: this.audioContext.state,
      stateMixerAudioContext: this.mixerAudioContext.state,
    });

    processor({
      audioContext: this.audioContext,
      mediaStreamDestination: this.mediaStreamDestination,
    });
  }

  public isMutedTrack(id: string): boolean {
    const isMutedTrack = this.idsMutedTracks.has(id);

    loggerAudioProcessor('isMutedTrack id, isMutedTrack: %o', { id, isMutedTrack });

    return isMutedTrack;
  }

  public isExistTrack(id: string): boolean {
    return this.getTrack(id) !== undefined;
  }

  public getTrack(id: string): MediaStreamAudioTrack | undefined {
    return this.tracks.get(id);
  }

  public getResult(): MediaStreamAudioTrack {
    const mixedTrack = this.mixer.getMixedTrack() as MediaStreamAudioTrack;

    loggerAudioProcessor('getResult: %o', {
      mixedTrackEnabled: mixedTrack.enabled,
      mixedTrackMuted: mixedTrack.muted,
      stateAudioContext: this.audioContext.state,
      stateMixerAudioContext: this.mixerAudioContext.state,
    });

    return mixedTrack;
  }

  public addTrack(id: string, track: MediaStreamAudioTrack): void {
    loggerAudioProcessor('addTrack: %o', {
      id,
      trackEnabled: track.enabled,
      trackMuted: track.muted,
      stateAudioContext: this.audioContext.state,
      stateMixerAudioContext: this.mixerAudioContext.state,
    });

    this.removeTrack(id);
    this.tracks.set(id, track);
    this.mixer.addTrack(track);
    this.syncMuteState(id);
  }

  public muteTrack(id: string) {
    loggerAudioProcessor('muteTrack: %o', { id });

    const foundTrack = this.getTrack(id);

    loggerAudioProcessor('muteTrack foundTrack: %o', {
      enabled: foundTrack?.enabled,
      muted: foundTrack?.muted,
    });

    if (foundTrack) {
      this.mixer.muteTrack(foundTrack);
    }

    this.idsMutedTracks.set(id, id);
  }

  public unmuteTrack(id: string) {
    loggerAudioProcessor('unmuteTrack id: %o', { id });

    const foundTrack = this.getTrack(id);

    loggerAudioProcessor('unmuteTrack foundTrack: %o', {
      enabled: foundTrack?.enabled,
      muted: foundTrack?.muted,
    });

    if (foundTrack) {
      this.mixer.unmuteTrack(foundTrack);
    }

    this.idsMutedTracks.delete(id);
  }

  public setVolume(id: string, volume: number): void {
    loggerAudioProcessor('setVolume:  %o', {
      id,
      volume,
      stateAudioContext: this.audioContext.state,
      stateMixerAudioContext: this.mixerAudioContext.state,
    });

    const track = this.getTrack(id);

    loggerAudioProcessor('unmuteTrack setVolume track:  %o', {
      enabled: track?.enabled,
      muted: track?.muted,
    });

    if (track) {
      this.mixer.setTrackVolume(track, volume);
    }
  }

  public stopAndRemoveTrack(id: string): void {
    loggerAudioProcessor('stopAndRemoveTrack: %o', { id });

    this.stopTrack(id);
    this.removeTrack(id);
  }

  public removeTrack(id: string): void {
    const track = this.getTrack(id);

    loggerAudioProcessor('removeTrack %o', {
      id,
      trackEnabled: track?.enabled,
      trackMuted: track?.muted,
      stateAudioContext: this.audioContext.state,
      stateMixerAudioContext: this.mixerAudioContext.state,
    });

    if (track) {
      this.mixer.removeTrack(track);
    }

    this.tracks.delete(id);
  }

  private stopTrack(id: string): void {
    const track = this.getTrack(id);

    loggerAudioProcessor('stopTrack track: %o', {
      id,
      trackEnabled: track?.enabled,
      trackMuted: track?.muted,
    });

    if (track) {
      track.stop();
    }
  }

  private initAudioContext() {
    this.audioContext.addEventListener('statechange', () => {
      loggerAudioProcessor('statechange of audioContext: %o', {
        stateAudioContext: this.audioContext.state,
        stateMixerAudioContext: this.mixerAudioContext.state,
      });

      this.maybeResumeWenUserInteraction();
    });
    this.mixerAudioContext.addEventListener('statechange', () => {
      loggerAudioProcessor('statechange of mixerAudioContext: %o', {
        stateAudioContext: this.audioContext.state,
        stateMixerAudioContext: this.mixerAudioContext.state,
      });

      this.maybeResumeWenUserInteraction();
    });

    this.maybeResumeWenUserInteraction();
  }

  private maybeResumeWenUserInteraction() {
    loggerAudioProcessor('maybeResumeWenUserInteraction: %o', {
      stateAudioContext: this.audioContext.state,
      stateMixerAudioContext: this.mixerAudioContext.state,
    });

    if (this.isSuspended || this.isSuspendedMixer) {
      waitUserInteraction()
        .then(() => {
          loggerAudioProcessor('maybeResume');

          this.maybeResume();
        })
        .catch((error: unknown) => {
          loggerAudioProcessor('failed to await user interaction - error:', error);
        });
    }
  }

  private maybeResume() {
    loggerAudioProcessor('maybeResume: %o', {
      stateAudioContext: this.audioContext.state,
      stateMixerAudioContext: this.mixerAudioContext.state,
    });

    if (this.isSuspended) {
      loggerAudioProcessor('resume this.audioContext');

      resumeAudioContext(this.audioContext);
    }

    if (this.isSuspendedMixer) {
      loggerAudioProcessor('resume this.mixerAudioContext');

      resumeAudioContext(this.mixerAudioContext);
    }
  }

  private syncMuteState(id: string) {
    loggerAudioProcessor('syncMuteState: %o', { id, stateAudioContext: this.audioContext.state });

    if (this.idsMutedTracks.has(id)) {
      loggerAudioProcessor('syncMuteState muteTrack id: %o', { id });

      this.muteTrack(id);
    } else {
      loggerAudioProcessor('syncMuteState muteTrack id: %o', { id });

      this.unmuteTrack(id);
    }
  }
}

export default AudioProcessor;
