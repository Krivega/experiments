import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import RotateLeftIcon from '@material-ui/icons/RotateLeft';
import TvIcon from '@material-ui/icons/Tv';
import Heading from './Heading';
import SettingsDevices from './SettingsDevices';
import ConstraintsList from './ConstraintsList';
import ButtonAction from './ButtonAction';

const SettingsDrawer = ({
  classes,
  videoDeviceId,
  videoDeviceList,
  setVideoDeviceFromId,
  videoConstraints,
  videoSettings,
  setVideoSettings,
  resetState,
  requestStream,
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
        <Heading>CAMERA SETTINGS</Heading>
        <ConstraintsList
          videoConstraints={videoConstraints}
          videoSettings={videoSettings}
          setVideoSettings={setVideoSettings}
          classes={classes}
        />
        <ButtonGroup className={classes.buttonGroup}>
          <ButtonAction
            classes={classes}
            icon={<TvIcon className={classes.extendedIcon} />}
            onClick={requestStream}
          >
            Request
          </ButtonAction>
          <ButtonAction
            classes={classes}
            icon={<RotateLeftIcon className={classes.extendedIcon} />}
            onClick={resetState}
          >
            Reset
          </ButtonAction>
        </ButtonGroup>
      </div>
    </Drawer>
  );
};

export default SettingsDrawer;
