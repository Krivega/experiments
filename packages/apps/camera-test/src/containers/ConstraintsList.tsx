import List from '@mui/material/List';
import React from 'react';

import VideoConstraint from './VideoConstraint';

import type { TVideoConstraints } from '../typings';
import type { TClasses } from '../useStyles';

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
            classes={classes}
            constraint={constraint}
            constraints={constraints}
            key={constraint}
            trackSettings={trackSettings}
            updateConstraints={updateConstraints}
            value={value}
          />
        );
      })}
    </List>
  );
};

export default ConstraintsList;
