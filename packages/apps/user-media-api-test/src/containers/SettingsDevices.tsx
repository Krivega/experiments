import React from 'react';
import List from '@material-ui/core/List';
import DeviceList from './DeviceList';
import ResolutionsList from './ResolutionsList';

const SettingsDevices = ({
  videoDeviceId,
  resolutionId,
  resolutionList,
  videoDeviceList,
  setResolutionId,
  setVideoDeviceFromId,
  classes,
}) => {
  return (
    <List>
      <DeviceList
        videoDeviceId={videoDeviceId}
        videoDeviceList={videoDeviceList}
        setVideoDeviceFromId={setVideoDeviceFromId}
        classes={classes}
      />
      <ResolutionsList
        resolutionId={resolutionId}
        resolutionList={resolutionList}
        setResolutionId={setResolutionId}
        classes={classes}
      />
    </List>
  );
};

export default SettingsDevices;
