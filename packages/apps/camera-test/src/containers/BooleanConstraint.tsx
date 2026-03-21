import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import React from 'react';

import type { TClasses } from '../useStyles';

const readConstraint = (constraints: MediaTrackConstraints, key: string): unknown => {
  return constraints[key as keyof MediaTrackConstraints];
};

const isBooleanSubfieldChecked = (
  constraints: MediaTrackConstraints,
  key: string,
  field: 'exact' | 'ideal',
): boolean => {
  const raw = readConstraint(constraints, key);

  if (typeof raw !== 'object' || raw === null) {
    return false;
  }

  return Boolean((raw as Record<string, unknown>)[field]);
};

type TProps = {
  constraintKey: string;
  value: {
    type: string;
    default: boolean;
    disabled: boolean;
    defaultObj: { exact: boolean; ideal: boolean };
  };
  updateConstraints: (additionalConstraints: MediaTrackConstraints) => void;
  constraints: MediaTrackConstraints;
  classes: TClasses;
};

const BooleanConstraint: React.FC<TProps> = ({
  value,
  constraintKey,
  constraints,
  updateConstraints,
  classes,
}) => {
  const resolveHandleBooleanConstraintsChange = (key: string) => {
    return ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = target;

      switch (name) {
        case key: {
          updateConstraints({
            [key]: checked,
          });

          break;
        }
        case 'exact': {
          updateConstraints({
            [key]: { exact: checked },
          });

          break;
        }
        case 'ideal': {
          updateConstraints({
            [key]: { ideal: checked },
          });

          break;
        }
        default: {
          break;
        }
      }
    };
  };

  const handleBooleanConstraintsChange = resolveHandleBooleanConstraintsChange(constraintKey);

  const constraintValue = readConstraint(constraints, constraintKey);
  const showAdvanced =
    constraintValue !== undefined && constraintValue !== null && constraintValue !== false;

  const children = (
    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={isBooleanSubfieldChecked(constraints, constraintKey, 'exact')}
            color="default"
            name="exact"
            size="small"
            onChange={handleBooleanConstraintsChange}
          />
        }
        label="exact"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={isBooleanSubfieldChecked(constraints, constraintKey, 'ideal')}
            color="default"
            name="ideal"
            size="small"
            onChange={handleBooleanConstraintsChange}
          />
        }
        label="ideal"
      />
    </Box>
  );

  return (
    <FormControl className={classes.formControl} variant="filled">
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={constraintValue === true}
              color="default"
              disabled={value.disabled}
              name={constraintKey}
              onChange={handleBooleanConstraintsChange}
            />
          }
          label={<Typography variant="h6">{constraintKey}</Typography>}
        />

        {showAdvanced ? children : undefined}
      </FormGroup>
    </FormControl>
  );
};

export default BooleanConstraint;
