import React from 'react';
import List from '@material-ui/core/List';
import VideoConstraint from './VideoConstraint';
import type { TClasses } from '../useStyles';
import type { TVideoConstraints } from '../typings';

type TProps = {
  classes: TClasses;
  videoConstraints: TVideoConstraints | null;
  videoSettings: TVideoConstraints;
  setVideoSettings: (settings: TVideoConstraints) => void;
};

const ConstraintsList: React.FC<TProps> = ({
  videoConstraints,
  videoSettings,
  setVideoSettings,
  classes,
}) => {
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
