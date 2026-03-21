import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import React, { useState, useEffect, useCallback } from 'react';

import ToggleButton from './ToggleButton';

import type { TClasses } from '../useStyles';

type TProps = {
  trackSettings: MediaTrackSettings;
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
  trackSettings,
  constraintKey,
  constraints,
  updateConstraints,
  classes,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(value.default);
  const renderStringOptionValue = (v: string, index: number) => {
    return (
      <option key={`${constraintKey}${v}${index}`} value={v}>
        {v}
      </option>
    );
  };

  useEffect(() => {
    if (Object.keys(constraints).length === 0) {
      setSelectedValue(value.default);
    }
  }, [value.default, constraints]);

  const resolveHandleStringConstraints = (constraint: string) => {
    return (event: SelectChangeEvent) => {
      const targetValue = event.target.value;

      setSelectedValue(targetValue);

      updateConstraints({
        [constraint]: targetValue,
      });
    };
  };

  const handleStringConstraints = resolveHandleStringConstraints(constraintKey);

  const onInactive = useCallback(() => {
    updateConstraints({
      [constraintKey]: undefined,
    });
  }, [constraintKey, updateConstraints]);

  const onActive = useCallback(() => {
    updateConstraints({
      [constraintKey]: trackSettings[constraintKey as keyof MediaTrackSettings],
    } as MediaTrackConstraints);
  }, [constraintKey, trackSettings, updateConstraints]);

  return (
    <ToggleButton
      disabled={value.disabled || value.values.length === 0}
      title={constraintKey}
      type="input"
      onActive={onActive}
      onInactive={onInactive}
    >
      <FormControl className={classes.formControl} variant="filled">
        <InputLabel htmlFor={constraintKey}>{constraintKey}</InputLabel>

        <Select
          native
          disabled={value.disabled || value.values.length === 0}
          inputProps={{
            name: constraintKey,
            id: constraintKey,
          }}
          value={selectedValue}
          onChange={handleStringConstraints}
        >
          {value.values.map(renderStringOptionValue)}
        </Select>
      </FormControl>
    </ToggleButton>
  );
};

export default StringOptionConstraint;
