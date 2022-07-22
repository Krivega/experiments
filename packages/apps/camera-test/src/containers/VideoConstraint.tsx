import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import {
  STRING_OPTION_CONSTRAINT,
  POINTS_OF_INTEREST_CONSTRAINT,
  BOOLEAN_CONSTRAINT,
  NUMBER_CONSTRAINT,
} from '../constants';
import type { TClasses } from '../useStyles';
import NumericConstraint from './NumericConstraint';
import BooleanConstraint from './BooleanConstraint';
import StringOptionConstraint from './StringOptionConstraint';
import PointOfInterestConstraint from './PointOfInterestConstraint';

type TProps = {
  constraint: string;
  value: any;
  classes: TClasses;
  constraints: MediaTrackConstraints;
  trackSettings: MediaTrackSettings;
  updateConstraints: (additionalConstraints: MediaTrackConstraints) => void;
};

const VideoConstraint: React.FC<TProps> = ({
  constraint,
  value,
  classes,
  constraints,
  trackSettings,
  updateConstraints,
}) => {
  if (value.type === BOOLEAN_CONSTRAINT) {
    return (
      <ListItem>
        <BooleanConstraint
          classes={classes}
          value={value}
          constraintKey={constraint}
          constraints={constraints}
          updateConstraints={updateConstraints}
        />
      </ListItem>
    );
  }

  if (value.type === STRING_OPTION_CONSTRAINT) {
    return (
      <ListItem>
        <StringOptionConstraint
          classes={classes}
          value={value}
          constraintKey={constraint}
          constraints={constraints}
          updateConstraints={updateConstraints}
        />
      </ListItem>
    );
  }

  if (value.type === POINTS_OF_INTEREST_CONSTRAINT) {
    return (
      <ListItem>
        <PointOfInterestConstraint
          value={value}
          constraintKey={constraint}
          constraints={constraints}
          updateConstraints={updateConstraints}
        />
      </ListItem>
    );
  }

  if (value.type === NUMBER_CONSTRAINT) {
    return (
      <ListItem>
        <NumericConstraint
          value={value}
          constraintKey={constraint}
          trackSettings={trackSettings}
          constraints={constraints}
          updateConstraints={updateConstraints}
        />
      </ListItem>
    );
  }

  return null;
};

export default VideoConstraint;
