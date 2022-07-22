import React, { useState, useEffect } from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import type { TClasses } from '../useStyles';

type TProps = {
  constraintKey: string;
  value: {
    type: string;
    default: string;
    disabled: boolean;
    values: string[];
  };
  updateConstraints: (additionalConstraints: MediaTrackConstraints) => void;
  constraints: MediaTrackConstraints;
  classes: TClasses;
};

const StringOptionConstraint: React.FC<TProps> = ({
  value,
  constraintKey,
  constraints,
  updateConstraints,
  classes,
}) => {
  const [val, setVal] = useState<string>(value.default);
  const renderStringOptionValue = (v: string, idx: number): JSX.Element => {
    return (
      <option value={v} key={`${constraintKey}${v}${idx}`}>
        {v}
      </option>
    );
  };

  useEffect(() => {
    if (Object.keys(constraints).length === 0) {
      setVal(value.default);
    }
  }, [value.default, constraints]);

  const resolveHandleStringConstraints = (constraint: string) => {
    return ({ target }) => {
      const { value: targetValue } = target;

      setVal(targetValue);

      updateConstraints({
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
        disabled={value.disabled || value.values.length === 0}
        value={val}
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
