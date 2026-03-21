import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import ListItem from '@mui/material/ListItem';
import Select from '@mui/material/Select';
import React from 'react';

import type { TResolution } from '@experiments/system-devices';
import type { TClasses } from '../useStyles';

const resolveHandleChangeInput = (handler: (value: string) => void) => {
  return ({ target }: { target: { value: string } }) => {
    const { value } = target;

    handler(value);
  };
};

type TProps = {
  resolutionId: string;
  resolutionList: TResolution[];
  classes: TClasses;
  setResolutionId: (id: string) => void;
};

const renderItemResolution = (item: TResolution, index: number) => {
  const { id } = item;

  return (
    <option key={`${id}${index}`} value={id}>
      {id}
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
      <FormControl className={classes.formControl} variant="filled">
        <InputLabel htmlFor="resolution">Resolution</InputLabel>

        <Select
          native
          inputProps={{
            name: 'resolution',
            id: 'resolution',
          }}
          value={resolutionId}
          onChange={resolveHandleChangeInput(setResolutionId)}
        >
          {resolutionList.map(renderItemResolution)}
        </Select>
      </FormControl>
    </ListItem>
  );
};

export default ResolutionsList;
