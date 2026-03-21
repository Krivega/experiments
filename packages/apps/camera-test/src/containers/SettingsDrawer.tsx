import Container from '@mui/material/Container';
import React from 'react';

import ConstraintsList from './ConstraintsList';
import Heading from './Heading';
import SettingsDevices from './SettingsDevices';

import type { TVideoConstraints } from '../typings';
import type { TClasses } from '../useStyles';

type TProps = {
  videoDeviceId: string;
  videoDeviceList: MediaDeviceInfo[];
  videoConstraintsList: TVideoConstraints | null;
  classes: TClasses;
  constraints: MediaTrackConstraints;
  trackSettings: MediaTrackSettings;
  updateConstraints: (value: MediaTrackConstraints) => void;
  setVideoDeviceFromId: (id: string) => void;
};

const SettingsDrawer: React.FC<TProps> = ({
  classes,
  videoDeviceId,
  videoDeviceList,
  setVideoDeviceFromId,
  videoConstraintsList,
  constraints,
  updateConstraints,
  trackSettings,
}) => {
  return (
    <div className={classes.drawer}>
      <SettingsDevices
        classes={classes}
        setVideoDeviceFromId={setVideoDeviceFromId}
        videoDeviceId={videoDeviceId}
        videoDeviceList={videoDeviceList}
      />

      <Container>
        <Heading>CAMERA SETTINGS</Heading>
      </Container>

      {videoConstraintsList ? (
        <ConstraintsList
          classes={classes}
          constraints={constraints}
          trackSettings={trackSettings}
          updateConstraints={updateConstraints}
          videoConstraintsList={videoConstraintsList}
        />
      ) : undefined}
    </div>
  );
};

export default SettingsDrawer;
