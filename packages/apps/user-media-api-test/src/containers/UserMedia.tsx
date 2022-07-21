import React from 'react';
import Media from '@experiments/components/src/Media';
import type { TClasses } from '../useStyles';

type TProps = {
  classes: TClasses;
  mediaStream: MediaStream | null;
};

const UserMedia: React.FC<TProps> = ({ classes, mediaStream }) => {
  if (!mediaStream) {
    return null;
  }

  return (
    <div className={classes.video}>
      <Media muted mediaStream={mediaStream} />
    </div>
  );
};

export default UserMedia;
