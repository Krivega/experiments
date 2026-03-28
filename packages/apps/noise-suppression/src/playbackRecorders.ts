import { PlaybackRecorder } from '@experiments/audio-utils';

export default class PlaybackRecorders {
  private readonly originalPlaybackRecorder: PlaybackRecorder;

  private readonly processedPlaybackRecorder: PlaybackRecorder;

  public constructor(playbackOriginal: HTMLAudioElement, playbackProcessed: HTMLAudioElement) {
    this.originalPlaybackRecorder = new PlaybackRecorder(playbackOriginal);
    this.processedPlaybackRecorder = new PlaybackRecorder(playbackProcessed);
  }

  public clearPlaybackUrls = () => {
    this.originalPlaybackRecorder.clearPlaybackUrl();
    this.processedPlaybackRecorder.clearPlaybackUrl();
  };

  public startRecording = (
    inputAudioTrack: MediaStreamAudioTrack,
    processedAudioTrack: MediaStreamAudioTrack,
  ) => {
    this.originalPlaybackRecorder.startRecording(inputAudioTrack);
    this.processedPlaybackRecorder.startRecording(processedAudioTrack);
  };

  public stopRecordingAndAssignPlayback = async () => {
    await Promise.all([
      this.originalPlaybackRecorder.stopRecordingAndAssignPlayback(),
      this.processedPlaybackRecorder.stopRecordingAndAssignPlayback(),
    ]);
  };
}
