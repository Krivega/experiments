import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import { TVideoConstraints } from '../typings';

const renderStringOptionValue = (value: string, idx): JSX.Element => {
  return (
    <option value={value} key={`${value}${idx}`}>
      {value}
    </option>
  );
};

const StringOptionConstraint = ({
  value,
  constraintKey,
  videoSettings,
  setVideoSettings,
  classes,
}: {
  constraintKey: string;
  value: {
    type: string;
    default: string;
    values: string[];
  };
  setVideoSettings: (value: TVideoConstraints) => void;
  videoSettings: TVideoConstraints;
  classes;
}) => {
  const resolveHandleStringConstraints = (constraint: string) => {
    return ({ target }) => {
      const { value: targetValue } = target;

      setVideoSettings({
        ...videoSettings,
        [constraint]: targetValue,
      });
    };
  };

  const handleStringConstraints = resolveHandleStringConstraints(constraintKey);

  return (
    <FormControl variant="filled" className={classes.formControl}>
      <InputLabel htmlFor={constraintKey}>{constraintKey}</InputLabel>
      <Select
        native
        value={videoSettings[constraintKey]}
        onChange={handleStringConstraints}
        inputProps={{
          name: constraintKey,
          id: constraintKey,
        }}
      >
        {value.values.map(renderStringOptionValue)}
      </Select>
    </FormControl>
  );
};

export default StringOptionConstraint;
