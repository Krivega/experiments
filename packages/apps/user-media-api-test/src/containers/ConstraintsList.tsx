import React from 'react';
import List from '@material-ui/core/List';
import VideoConstraint from './VideoConstraint';

const ConstraintsList = ({ videoConstraints, videoSettings, setVideoSettings, classes }) => {
  if (!videoConstraints) {
    return null;
  }

  return (
    <List>
      {Object.entries(videoConstraints).map(([constraint, value]) => {
        return (
          <VideoConstraint
            key={constraint}
            constraint={constraint}
            value={value}
            classes={classes}
            videoSettings={videoSettings}
            setVideoSettings={setVideoSettings}
          />
        );
      })}
    </List>
  );
};

export default ConstraintsList;
