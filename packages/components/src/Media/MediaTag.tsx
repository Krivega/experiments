/* eslint-disable react/boolean-prop-naming */
import logger from '../logger';

import type React from 'react';

export type TMediaElement = HTMLVideoElement;

type TProperties = {
  type: 'audio' | 'video';
  mirror: boolean;
  hidden?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  transparent?: boolean;
  disablePictureInPicture?: boolean;
  testid?: string;
  forwardedRef?: React.ForwardedRef<TMediaElement>;
};

const MediaTag: React.FC<TProperties> = ({
  mirror,
  hidden,
  transparent,
  testid,
  forwardedRef,
  type,
  controls,
  disablePictureInPicture,
  playsInline = true,
}) => {
  logger('render', {
    mirror,
    hidden,
    transparent,
    testid,
    forwardedRef,
    type,
    controls,
    playsInline,
  });

  if (type === 'audio') {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <audio controls={controls} data-testid={testid} preload="auto" ref={forwardedRef} />
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video
      controls={controls}
      data-testid={testid}
      disablePictureInPicture={disablePictureInPicture}
      playsInline={playsInline}
      preload="auto"
      ref={forwardedRef}
    />
  );
};

export default MediaTag;
