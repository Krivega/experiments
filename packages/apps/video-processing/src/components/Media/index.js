import React from 'react';
import PropTypes from 'prop-types';

class Media extends React.Component {
  mediaRef = React.createRef();

  componentDidMount() {
    const { onEnded } = this.props;

    this.update();
    this.mediaRef.current.addEventListener('ended', onEnded);
  }

  shouldComponentUpdate({
    mediaStream: prevMediaStream,
    src: prevSrc,
    sinkId: prevSinkId,
    type: prevType,
    volume: prevVolume,
    muted: prevMuted,
  }) {
    const { mediaStream, src, sinkId, type, muted, volume } = this.props;

    return (
      mediaStream !== prevMediaStream ||
      src !== prevSrc ||
      sinkId !== prevSinkId ||
      type !== prevType ||
      volume !== prevVolume ||
      muted !== prevMuted
    );
  }

  componentDidUpdate() {
    this.update();
  }

  componentWillUnmount() {
    const { onEnded } = this.props;
    const { current: mediaEl } = this.mediaRef;

    mediaEl.removeEventListener('ended', onEnded);
  }

  async update() {
    const { mediaStream, src, sinkId, autoplay, muted, loop, volume } = this.props;
    const { current: mediaEl } = this.mediaRef;

    if (mediaEl.setSinkId && sinkId && mediaEl.sinkId !== sinkId) {
      await mediaEl.setSinkId(sinkId);
    }

    if (mediaEl.muted !== muted) {
      mediaEl.muted = muted;
    }

    if (mediaStream && mediaEl.srcObject !== mediaStream) {
      mediaEl.srcObject = mediaStream;
    }

    if (src && mediaEl.src !== src) {
      mediaEl.src = src;
    }

    if (mediaEl.autoplay !== autoplay) {
      mediaEl.autoplay = autoplay;
    }

    if (mediaEl.loop !== loop) {
      mediaEl.loop = loop;
    }

    if (mediaEl.volume !== volume) {
      mediaEl.volume = volume;
    }
  }

  play() {
    this.mediaRef.current.play();
  }

  stop() {
    const { current: mediaEl } = this.mediaRef;

    mediaEl.pause();
    mediaEl.currentTime = 0;
  }

  requestPictureInPicture(onLeave) {
    const { current: mediaEl } = this.mediaRef;

    if (mediaEl && mediaEl.requestPictureInPicture) {
      return mediaEl.requestPictureInPicture().then(() => {
        mediaEl.addEventListener('leavepictureinpicture', onLeave);

        return () => {
          mediaEl.removeEventListener('leavepictureinpicture', onLeave);
        };
      });
    }

    return Promise.reject();
  }

  render() {
    const { preload, type, volume, muted } = this.props;

    if (type === 'audio') {
      return <audio ref={this.mediaRef} preload={preload} volume={volume} muted={muted} />;
    }

    return <video ref={this.mediaRef} preload={preload} playsInline />;
  }
}

Media.propTypes = {
  type: PropTypes.string,
  mediaStream: PropTypes.shape({
    active: PropTypes.bool,
    ended: PropTypes.bool,
    id: PropTypes.string,
  }),
  sinkId: PropTypes.string,
  src: PropTypes.string,
  mirror: PropTypes.bool,
  loop: PropTypes.bool,
  muted: PropTypes.bool,
  autoplay: PropTypes.bool,
  preload: PropTypes.string,
  onEnded: PropTypes.func,
  volume: PropTypes.number,
  isMutedAudio: PropTypes.bool,
};

Media.defaultProps = {
  type: 'video',
  sinkId: undefined,
  src: undefined,
  muted: false,
  autoplay: true,
  mirror: false,
  loop: false,
  mediaStream: null,
  preload: 'auto',
  onEnded: () => {},
  volume: 1,
  isMutedAudio: false,
};

export default Media;
