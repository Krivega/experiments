import React from 'react';
import List from '@material-ui/core/List';
import VideoConstraint from './VideoConstraint';
import type { TClasses } from '../useStyles';
import type { TVideoConstraints } from '../typings';

type TProps = {
  classes: TClasses;
  videoConstraintsList: TVideoConstraints;
  constraints: MediaTrackConstraints;
  trackSettings: MediaTrackSettings;
  updateConstraints: (additionalConstraints: MediaTrackConstraints) => void;
};

const ConstraintsList: React.FC<TProps> = ({
  videoConstraintsList,
  constraints,
  updateConstraints,
  trackSettings,
  classes,
}) => {
  return (
    <List>
      {Object.entries(videoConstraintsList).map(([constraint, value]) => {
        return (
          <VideoConstraint
            key={constraint}
            constraint={constraint}
            trackSettings={trackSettings}
            value={value}
            classes={classes}
            constraints={constraints}
            updateConstraints={updateConstraints}
          />
        );
      })}
    </List>
  );
};

export default ConstraintsList;
