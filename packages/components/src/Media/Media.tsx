/* eslint-disable react/boolean-prop-naming */
import { setSinkId, setVolume } from '@experiments/audio-utils';
import { resolvers } from '@experiments/utils';
import React, { useEffect } from 'react';

import MediaTag from './MediaTag';
import logger from '../logger';

import type { TMediaElement } from './MediaTag';

const { noop } = resolvers.components;

export type TProperties = {
  mediaStream?: MediaStream;
  src?: string;
  type?: 'audio' | 'video';
  volume?: number;
  testid?: string;
  sinkId?: string;
  controls?: boolean;
  playsInline?: boolean;
  disablePictureInPicture?: boolean;
  mirror?: boolean;
  muted?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  isPauseOnLoop?: boolean;
  hidden?: boolean;
  transparent?: boolean;
  forwardedRef?: React.ForwardedRef<HTMLAudioElement | HTMLVideoElement>;
  onCanPlayThrough?: (mediaElement: HTMLVideoElement) => void;
  onVolumeChange?: (volume: number) => void;
  onError?: () => void;
};

const Media: React.FC<TProperties> = ({
  mediaStream,
  src,
  transparent,
  sinkId,
  forwardedRef,
  testid,
  type = 'video',
  controls,
  mirror = false,
  playsInline = true,
  hidden = false,
  autoplay = true,
  isPauseOnLoop = false,
  muted,
  loop = false,
  volume,
  disablePictureInPicture,
  onVolumeChange,
  onCanPlayThrough = noop,
  onError = noop,
}) => {
  const mediaReference = React.createRef<TMediaElement>();

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement) {
      return () => {};
    }

    mediaElement.addEventListener('error', onError);

    return () => {
      mediaElement.removeEventListener('error', onError);
    };
  }, [mediaReference, onError]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (mediaElement && mediaElement.autoplay !== autoplay) {
      mediaElement.autoplay = autoplay;
    }

    if (!mediaElement) {
      return () => {};
    }

    const updatePlay = () => {
      onCanPlayThrough(mediaElement);

      if (mediaElement.paused && autoplay) {
        logger('play');
        mediaElement
          .play()
          .then(() => {
            logger('play: success');
          })
          .catch((error: unknown) => {
            logger('play: error', error);
          });
      }
    };

    mediaElement.addEventListener('canplaythrough', updatePlay, { once: true });

    return () => {
      mediaElement.removeEventListener('canplaythrough', updatePlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, onCanPlayThrough]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement || !isPauseOnLoop) {
      return () => {};
    }

    const pauseIfZero = () => {
      if (mediaElement.currentTime === 0) {
        mediaElement.pause();
      }
    };

    mediaElement.addEventListener('timeupdate', pauseIfZero);

    return () => {
      mediaElement.removeEventListener('timeupdate', pauseIfZero);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPauseOnLoop]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement || !onVolumeChange) {
      return () => {};
    }

    const handleVolumeChange = () => {
      onVolumeChange(mediaElement.volume);
    };

    mediaElement.addEventListener('volumechange', handleVolumeChange);

    return () => {
      mediaElement.removeEventListener('volumechange', handleVolumeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onVolumeChange]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (mediaElement && mediaElement.autoplay !== autoplay) {
      mediaElement.autoplay = autoplay;
    }

    if (!mediaElement) {
      return () => {};
    }

    const updatePlay = () => {
      onCanPlayThrough(mediaElement);

      if (mediaElement.paused && autoplay) {
        logger('play');
        mediaElement
          .play()
          .then(() => {
            logger('play: success');
          })
          .catch((error: unknown) => {
            logger('play: error', error);
          });
      }
    };

    mediaElement.addEventListener('canplaythrough', updatePlay, { once: true });

    return () => {
      mediaElement.removeEventListener('canplaythrough', updatePlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, onCanPlayThrough]);

  useEffect(() => {
    if (!forwardedRef) {
      return;
    }

    // @ts-expect-error
    // eslint-disable-next-line no-param-reassign
    forwardedRef.current = mediaReference.current;
  }, [mediaReference, forwardedRef]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement) {
      return;
    }

    logger('update srcObject mediaStream', mediaStream, mediaElement.srcObject);

    if (mediaStream && mediaElement.srcObject !== mediaStream) {
      logger('update !!!SET!!! srcObject');
      mediaElement.srcObject = mediaStream;
    }
  }, [mediaReference, mediaStream]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement) {
      return;
    }

    logger('update src mediaStream');

    if (src !== undefined && src !== '' && mediaElement.src !== src) {
      logger('update !!!SET!!! src');
      mediaElement.src = src;
    }
  }, [mediaReference, src]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement) {
      return () => {};
    }

    let isPlaying = false;
    const setPlay = () => {
      isPlaying = true;
    };
    const setPause = () => {
      isPlaying = false;
    };

    const fixPlaying = () => {
      logger('fixPlaying: isPlaying', isPlaying);
      setTimeout(() => {
        if (isPlaying) {
          mediaElement
            .play()
            .then(() => {
              logger('play: success');
            })
            .catch((error: unknown) => {
              logger('play: error', error);
            });
        }
      }, 0);
    };

    mediaElement.addEventListener('leavepictureinpicture', fixPlaying);
    mediaElement.addEventListener('play', setPlay);
    mediaElement.addEventListener('pause', setPause);

    return () => {
      mediaElement.removeEventListener('leavepictureinpicture', fixPlaying);
      mediaElement.removeEventListener('play', setPlay);
      mediaElement.removeEventListener('pause', setPause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    return () => {
      logger('update !!!UNSET!!! srcObject', mediaElement?.srcObject);

      if (mediaElement) {
        if (document.pictureInPictureElement === mediaElement) {
          document.exitPictureInPicture().catch((error: unknown) => {
            logger('exitPictureInPicture: error', error);
          });
        }

        // for dispose link to active media stream from memory
        // eslint-disable-next-line unicorn/no-null
        mediaElement.srcObject = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement || muted === undefined) {
      return;
    }

    logger('update muted', muted, mediaElement.muted);

    if (mediaElement.muted !== muted) {
      logger('update !!!SET!!! muted', muted);
      mediaElement.muted = muted;
    }
  }, [mediaReference, muted]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement) {
      return;
    }

    logger('update loop', loop, mediaElement.loop);

    if (mediaElement.loop !== loop) {
      logger('update !!!SET!!! loop', loop);
      mediaElement.loop = loop;
    }
  }, [mediaReference, loop]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement || volume === undefined) {
      return;
    }

    setVolume(mediaElement, volume, logger);
  }, [mediaReference, volume]);

  useEffect(() => {
    const mediaElement = mediaReference.current;

    if (!mediaElement) {
      return;
    }

    setSinkId(mediaElement, sinkId, logger).catch((error: unknown) => {
      logger('error', error);
    });
  }, [mediaReference, sinkId]);

  return (
    <MediaTag
      controls={controls}
      disablePictureInPicture={disablePictureInPicture}
      forwardedRef={mediaReference}
      hidden={hidden}
      mirror={mirror}
      playsInline={playsInline}
      testid={testid}
      transparent={transparent}
      type={type}
    />
  );
};

export default Media;
