import React from 'react';
import List from '@material-ui/core/List';
import DeviceList from './DeviceList';

const SettingsDevices = ({ videoDeviceId, videoDeviceList, setVideoDeviceFromId, classes }) => {
  return (
    <List>
      <DeviceList
        videoDeviceId={videoDeviceId}
        videoDeviceList={videoDeviceList}
        setVideoDeviceFromId={setVideoDeviceFromId}
        classes={classes}
      />
    </List>
  );
};

export default SettingsDevices;
