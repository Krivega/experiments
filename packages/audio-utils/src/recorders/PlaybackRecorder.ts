/* eslint-disable @typescript-eslint/parameter-properties */

import RecorderInPage from './RecorderInPage';

export default class PlaybackRecorder {
  private url?: string;

  private recorder?: RecorderInPage;

  public constructor(private readonly playback: HTMLAudioElement) {}

  public clearPlaybackUrl = () => {
    if (this.url !== undefined) {
      URL.revokeObjectURL(this.url);
      this.url = undefined;
    }

    this.playback.removeAttribute('src');
  };

  public startRecording = (audioTrack: MediaStreamAudioTrack) => {
    if (this.recorder !== undefined) {
      const previous = this.recorder;

      this.recorder = undefined;
      previous.stop().catch(() => {
        /* abandoned session — ignore */
      });
    }

    this.recorder = new RecorderInPage(audioTrack);
    this.recorder.start();
  };

  public stopRecordingAndAssignPlayback = async () => {
    if (this.recorder === undefined) {
      return;
    }

    const blob = await this.recorder.stop();

    this.recorder = undefined;
    this.assignPlaybackFromBlob(blob);
  };

  public assignPlaybackFromBlob = (blob: Blob) => {
    this.clearPlaybackUrl();
    this.url = URL.createObjectURL(blob);
    this.playback.src = this.url;
  };
}
