import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItem from '@mui/material/ListItem';
import Select from '@mui/material/Select';
import React from 'react';

import type { TClasses } from '../useStyles';

const parseItemDevice = (device: MediaDeviceInfo) => {
  return {
    label: device.label,
    value: device.deviceId,
  };
};

type TProps = {
  videoDeviceId: string;
  videoDeviceList: MediaDeviceInfo[];
  classes: TClasses;
  setVideoDeviceFromId: (id: string) => void;
};

const resolveHandleChangeInput = (handler: (value: string) => void) => {
  return ({ target }: { target: { value: string } }) => {
    const { value } = target;

    handler(value);
  };
};

const renderItemDevice = (item: MediaDeviceInfo, index: number) => {
  const { label, value } = parseItemDevice(item);

  return (
    <option key={`${value}${index}`} value={value}>
      {label}
    </option>
  );
};

const DeviceList: React.FC<TProps> = ({
  videoDeviceId,
  videoDeviceList,
  setVideoDeviceFromId,
  classes,
}) => {
  return (
    <ListItem>
      <FormControl className={classes.formControl} variant="filled">
        <InputLabel htmlFor="cam">Cam</InputLabel>

        <Select
          native
          inputProps={{
            name: 'cam',
            id: 'cam',
          }}
          value={videoDeviceId}
          onChange={resolveHandleChangeInput(setVideoDeviceFromId)}
        >
          {videoDeviceList.map(renderItemDevice)}
        </Select>
      </FormControl>
    </ListItem>
  );
};

export default DeviceList;
