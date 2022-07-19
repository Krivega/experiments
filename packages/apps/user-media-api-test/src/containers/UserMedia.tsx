import React from 'react';
import Media from '@experiments/components/src/Media';

const UserMedia = ({ classes, mediaStream }) => {
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
