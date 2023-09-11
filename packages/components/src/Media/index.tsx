/* eslint-disable react/default-props-match-prop-types */
import React from 'react';

type TPropsRequired = {
  type: 'video' | 'audio';
};

type TPropsOptional = {
  volume: number;
  preload: string;
  testid?: string;
  mediaStream?: MediaStream;
  sinkId?: string;
  src?: string;
  mirror: boolean;
  loop: boolean;
  muted: boolean;
  autoplay: boolean;
  isMutedAudio: boolean;
  hidden?: boolean;
  onEnded: () => void;
};

type TProps = TPropsRequired & TPropsOptional;

type TMedia = HTMLAudioElement | HTMLVideoElement;

class Media extends React.Component<TProps> {
  static defaultProps: Partial<TProps> = {
    volume: 1,
    preload: 'auto',
    muted: false,
    autoplay: true,
    mirror: false,
    loop: false,
    isMutedAudio: false,
    onEnded: () => {},
    hidden: false,
  };

  // eslint-disable-next-line react/sort-comp
  mediaRef = React.createRef<TMedia>();

  componentDidMount() {
    const { onEnded } = this.props;

    this.mediaRef.current?.addEventListener('ended', onEnded);
    this.mediaRef.current?.addEventListener('canplay', this.onCanPlay);
    this.update();
  }

  shouldComponentUpdate({
    mediaStream: prevMediaStream,
    src: prevSrc,
    sinkId: prevSinkId,
    type: prevType,
    volume: prevVolume,
    mirror: prevMirror,
    muted: prevMuted,
    hidden: prevHidden,
  }: TProps) {
    const { mediaStream, src, sinkId, type, muted, volume, hidden, mirror } = this.props;

    return (
      mediaStream !== prevMediaStream ||
      src !== prevSrc ||
      sinkId !== prevSinkId ||
      mirror !== prevMirror ||
      type !== prevType ||
      volume !== prevVolume ||
      muted !== prevMuted ||
      hidden !== prevHidden
    );
  }

  componentDidUpdate() {
    this.update();
  }

  componentWillUnmount() {
    const { onEnded } = this.props;

    this.mediaRef.current?.removeEventListener('ended', onEnded);
    this.mediaRef.current?.removeEventListener('canplay', this.onCanPlay);

    if (this.mediaRef.current) {
      // for dispose link to active media stream from memory
      this.mediaRef.current.srcObject = null;
    }
  }

  onCanPlay = () => {
    const { current: mediaEl } = this.mediaRef;
    const { autoplay } = this.props;

    if (autoplay && mediaEl && mediaEl.paused) {
      this.play();
    }
  };

  update() {
    this.updateSrcMedia();
    this.updatePropsMedia();
  }

  updateSrcMedia() {
    const { mediaStream, src } = this.props;
    const { current: mediaEl } = this.mediaRef;

    if (!mediaEl) {
      return undefined;
    }

    if (mediaStream && mediaEl.srcObject !== mediaStream) {
      mediaEl.srcObject = mediaStream;
    }

    if (src && mediaEl.src !== src) {
      mediaEl.src = src;
    }

    return undefined;
  }

  async updatePropsMedia() {
    const { sinkId, autoplay, muted, loop, volume } = this.props;

    const { current: mediaEl } = this.mediaRef;

    if (!mediaEl) {
      return undefined;
    }

    // @ts-ignore
    if (mediaEl.setSinkId && sinkId && mediaEl.sinkId !== sinkId) {
      try {
        // @ts-ignore
        await mediaEl.setSinkId(sinkId);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('updatePropsMedia setSinkId', mediaEl, error, this.props);
      }
    }

    if (mediaEl.muted !== muted) {
      mediaEl.muted = muted;
    }

    if (autoplay !== undefined && mediaEl.autoplay !== autoplay) {
      mediaEl.autoplay = autoplay;
    }

    if (loop !== undefined && mediaEl.loop !== loop) {
      mediaEl.loop = loop;
    }

    if (mediaEl.volume !== volume) {
      mediaEl.volume = volume;
    }

    return undefined;
  }

  play() {
    const { current: mediaEl } = this.mediaRef;

    if (!mediaEl) {
      return Promise.reject(new Error('Media not found'));
    }

    return mediaEl.play();
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  stop() {
    const { current: mediaEl } = this.mediaRef;

    if (mediaEl) {
      mediaEl.pause();
      mediaEl.currentTime = 0;
    }
  }

  render() {
    const { preload, type, volume, muted, testid } = this.props;

    if (type === 'audio') {
      return (
        <audio
          data-testid={testid}
          ref={this.mediaRef}
          preload={preload}
          // @ts-ignore
          // eslint-disable-next-line react/no-unknown-property
          volume={volume}
          muted={muted}
        />
      );
    }

    return (
      <video
        // eslint-disable-next-line react/no-unknown-property
        volume={volume}
        muted={muted}
        data-testid={testid}
        // @ts-ignore
        ref={this.mediaRef}
        preload={preload}
        playsInline
      />
    );
  }
}

export default Media;
