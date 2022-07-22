import React from 'react';
import List from '@material-ui/core/List';
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
        videoDeviceId={videoDeviceId}
        videoDeviceList={videoDeviceList}
        setVideoDeviceFromId={setVideoDeviceFromId}
        classes={classes}
      />
    </List>
  );
};

export default SettingsDevices;
