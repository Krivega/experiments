import List from '@mui/material/List';
import React from 'react';

import DeviceList from './DeviceList';

import type { TClasses } from '../useStyles';

type TProps = {
  videoDeviceId: string;
  videoDeviceList: MediaDeviceInfo[];
  classes: TClasses;
  setVideoDeviceFromId: (id: string) => void;
};

const SettingsDevices: React.FC<TProps> = ({
  videoDeviceId,
  videoDeviceList,
  setVideoDeviceFromId,
  classes,
}) => {
  return (
    <List>
      <DeviceList
        classes={classes}
        setVideoDeviceFromId={setVideoDeviceFromId}
        videoDeviceId={videoDeviceId}
        videoDeviceList={videoDeviceList}
      />
    </List>
  );
};

export default SettingsDevices;
