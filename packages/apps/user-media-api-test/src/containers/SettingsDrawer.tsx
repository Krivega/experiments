import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import Heading from './Heading';
import SettingsDevices from './SettingsDevices';
import ConstraintsList from './ConstraintsList';
import ButtonReset from './ButtonReset';

const SettingsDrawer = ({
  classes,
  videoDeviceId,
  resolutionId,
  resolutionList,
  videoDeviceList,
  setResolutionId,
  setVideoDeviceFromId,
  videoConstraints,
  videoSettings,
  setVideoSettings,
  resetState,
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
          resolutionId={resolutionId}
          resolutionList={resolutionList}
          videoDeviceList={videoDeviceList}
          setResolutionId={setResolutionId}
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
        <ButtonReset classes={classes} resetState={resetState}>
          Reset
        </ButtonReset>
      </div>
    </Drawer>
  );
};

export default SettingsDrawer;
