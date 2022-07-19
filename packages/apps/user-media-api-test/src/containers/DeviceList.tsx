import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import ListItem from '@material-ui/core/ListItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import resolveHandleChangeInput from '@experiments/utils/src/resolveHandleChangeInput';
import parseItemDevice from '@experiments/system-devices/src/parseItemDevice';

const renderItemDevice = (item, index) => {
  const { label, value } = parseItemDevice(item);

  return (
    <option value={value} key={`${value}${index}`}>
      {label}
    </option>
  );
};

const DeviceList = ({ videoDeviceId, videoDeviceList, setVideoDeviceFromId, classes }) => {
  return (
    <ListItem>
      <FormControl variant="filled" className={classes.formControl}>
        <InputLabel htmlFor="cam">Cam</InputLabel>
        <Select
          native
          value={videoDeviceId}
          onChange={resolveHandleChangeInput(setVideoDeviceFromId)}
          inputProps={{
            name: 'cam',
            id: 'cam',
          }}
        >
          {videoDeviceList.map(renderItemDevice)}
        </Select>
      </FormControl>
    </ListItem>
  );
};

export default DeviceList;
