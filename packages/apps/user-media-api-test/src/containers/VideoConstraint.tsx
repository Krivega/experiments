import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import {
  STRING_OPTION_CONSTRAINT,
  POINTS_OF_INTEREST_CONSTRAINT,
  BOOLEAN_CONSTRAINT,
} from '../constants';
import NumericConstraint from './NumericConstraint';
import BooleanConstraint from './BooleanConstraint';
import StringOptionConstraint from './StringOptionConstraint';
import PointOfInterestConstraint from './PointOfInterestConstraint';

const VideoConstraint = ({ constraint, value, classes, videoSettings, setVideoSettings }) => {
  if (value.type === BOOLEAN_CONSTRAINT) {
    return (
      <ListItem>
        <BooleanConstraint
          classes={classes}
          value={value}
          constraintKey={constraint}
          videoSettings={videoSettings}
          setVideoSettings={setVideoSettings}
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
          videoSettings={videoSettings}
          setVideoSettings={setVideoSettings}
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
          videoSettings={videoSettings}
          setVideoSettings={setVideoSettings}
        />
      </ListItem>
    );
  }

  return (
    <ListItem>
      <NumericConstraint
        value={value}
        constraintKey={constraint}
        videoSettings={videoSettings}
        setVideoSettings={setVideoSettings}
      />
    </ListItem>
  );
};

export default VideoConstraint;
