import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import ListItem from '@material-ui/core/ListItem';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import resolveHandleChangeInput from '@experiments/utils/src/resolveHandleChangeInput';
import type { TResolution } from '@experiments/system-devices/src/resolutionsList';
import type { TClasses } from '../useStyles';

type TProps = {
  resolutionId: string;
  resolutionList: TResolution[];
  classes: TClasses;
  setResolutionId: (id: string) => void;
};

const renderItemResolution = (item: TResolution, index: number) => {
  const { id, label } = item;

  return (
    <option value={id} key={`${id}${index}`}>
      {label}
    </option>
  );
};

const ResolutionsList: React.FC<TProps> = ({
  resolutionId,
  resolutionList,
  setResolutionId,
  classes,
}) => {
  return (
    <ListItem>
      <FormControl variant="filled" className={classes.formControl}>
        <InputLabel htmlFor="resolution">Resolution</InputLabel>
        <Select
          native
          value={resolutionId}
          onChange={resolveHandleChangeInput(setResolutionId)}
          inputProps={{
            name: 'resolution',
            id: 'resolution',
          }}
        >
          {resolutionList.map(renderItemResolution)}
        </Select>
      </FormControl>
    </ListItem>
  );
};

export default ResolutionsList;
