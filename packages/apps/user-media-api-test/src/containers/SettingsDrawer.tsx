import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Container from '@material-ui/core/Container';
import Heading from './Heading';
import type { TClasses } from '../useStyles';
import { TVideoConstraints } from '../typings';
import SettingsDevices from './SettingsDevices';
import ConstraintsList from './ConstraintsList';

type TProps = {
  videoDeviceId: string;
  videoDeviceList: MediaDeviceInfo[];
  videoConstraints: TVideoConstraints | null;
  classes: TClasses;
  videoSettings: TVideoConstraints;
  isInitialized: boolean;
  setVideoSettings: (value: TVideoConstraints) => void;
  setVideoDeviceFromId: (id: string) => void;
};

const SettingsDrawer: React.FC<TProps> = ({
  classes,
  videoDeviceId,
  videoDeviceList,
  setVideoDeviceFromId,
  videoConstraints,
  videoSettings,
  setVideoSettings,
  isInitialized,
}) => {
  if (!isInitialized) {
    return null;
  }

  return (
    <Drawer open anchor="right" variant="persistent">
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
        <ConstraintsList
          videoConstraints={videoConstraints}
          videoSettings={videoSettings}
          setVideoSettings={setVideoSettings}
          classes={classes}
        />
      </div>
    </Drawer>
  );
};

export default SettingsDrawer;
