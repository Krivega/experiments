import React from 'react';
import Container from '@material-ui/core/Container';
import Heading from './Heading';
import type { TClasses } from '../useStyles';
import type { TVideoConstraints } from '../typings';
import SettingsDevices from './SettingsDevices';
import ConstraintsList from './ConstraintsList';

type TProps = {
  videoDeviceId: string;
  videoDeviceList: MediaDeviceInfo[];
  videoConstraintsList: TVideoConstraints | null;
  classes: TClasses;
  constraints: MediaTrackConstraints;
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
}) => {
  return (
    <div className={classes.drawer}>
      <SettingsDevices
        videoDeviceId={videoDeviceId}
        videoDeviceList={videoDeviceList}
        setVideoDeviceFromId={setVideoDeviceFromId}
        classes={classes}
      />
      <Container>
        <Heading>CAMERA SETTINGS</Heading>
      </Container>
      {videoConstraintsList && (
        <ConstraintsList
          videoConstraintsList={videoConstraintsList}
          constraints={constraints}
          updateConstraints={updateConstraints}
          classes={classes}
        />
      )}
    </div>
  );
};

export default SettingsDrawer;
