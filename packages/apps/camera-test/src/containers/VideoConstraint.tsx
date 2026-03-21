import ListItem from '@mui/material/ListItem';
import React, { type ComponentProps } from 'react';

import {
  STRING_OPTION_CONSTRAINT,
  POINTS_OF_INTEREST_CONSTRAINT,
  BOOLEAN_CONSTRAINT,
  NUMBER_CONSTRAINT,
} from '../constants';
import BooleanConstraint from './BooleanConstraint';
import NumericConstraint from './NumericConstraint';
import PointOfInterestConstraint from './PointOfInterestConstraint';
import StringOptionConstraint from './StringOptionConstraint';

import type { TClasses } from '../useStyles';

type TProps = {
  constraint: string;
  value: unknown;
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
  if (typeof value !== 'object' || value === null || !('type' in value)) {
    return undefined;
  }

  const constraintConfig = value as { type: string };

  if (constraintConfig.type === BOOLEAN_CONSTRAINT) {
    return (
      <ListItem>
        <BooleanConstraint
          classes={classes}
          constraintKey={constraint}
          constraints={constraints}
          updateConstraints={updateConstraints}
          value={value as ComponentProps<typeof BooleanConstraint>['value']}
        />
      </ListItem>
    );
  }

  if (constraintConfig.type === STRING_OPTION_CONSTRAINT) {
    return (
      <ListItem>
        <StringOptionConstraint
          classes={classes}
          constraintKey={constraint}
          constraints={constraints}
          trackSettings={trackSettings}
          updateConstraints={updateConstraints}
          value={value as ComponentProps<typeof StringOptionConstraint>['value']}
        />
      </ListItem>
    );
  }

  if (constraintConfig.type === POINTS_OF_INTEREST_CONSTRAINT) {
    return (
      <ListItem>
        <PointOfInterestConstraint
          constraintKey={constraint}
          constraints={constraints}
          trackSettings={trackSettings}
          updateConstraints={updateConstraints}
          value={value as ComponentProps<typeof PointOfInterestConstraint>['value']}
        />
      </ListItem>
    );
  }

  if (constraintConfig.type === NUMBER_CONSTRAINT) {
    return (
      <ListItem>
        <NumericConstraint
          constraintKey={constraint}
          constraints={constraints}
          trackSettings={trackSettings}
          updateConstraints={updateConstraints}
          value={value as ComponentProps<typeof NumericConstraint>['value']}
        />
      </ListItem>
    );
  }

  return undefined;
};

export default VideoConstraint;
