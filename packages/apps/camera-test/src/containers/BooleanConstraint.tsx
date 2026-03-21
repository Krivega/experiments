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
    /** Set by App from track capabilities; optional for static config. */
    disabled?: boolean;
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
  const isControlDisabled = value.disabled === true;

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

  const disabledLabelSx = isControlDisabled ? { color: 'text.disabled' } : undefined;

  const children = (
    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={isBooleanSubfieldChecked(constraints, constraintKey, 'exact')}
            color="default"
            disabled={isControlDisabled}
            name="exact"
            size="small"
            onChange={handleBooleanConstraintsChange}
          />
        }
        disabled={isControlDisabled}
        label={
          <Typography component="span" sx={disabledLabelSx} variant="body2">
            exact
          </Typography>
        }
        labelPlacement="start"
        sx={{ justifyContent: 'space-between', m: 0, width: '100%' }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={isBooleanSubfieldChecked(constraints, constraintKey, 'ideal')}
            color="default"
            disabled={isControlDisabled}
            name="ideal"
            size="small"
            onChange={handleBooleanConstraintsChange}
          />
        }
        disabled={isControlDisabled}
        label={
          <Typography component="span" sx={disabledLabelSx} variant="body2">
            ideal
          </Typography>
        }
        labelPlacement="start"
        sx={{ justifyContent: 'space-between', m: 0, width: '100%' }}
      />
    </Box>
  );

  return (
    <FormControl className={classes.formControl} disabled={isControlDisabled} variant="filled">
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={constraintValue === true}
              color="default"
              disabled={isControlDisabled}
              name={constraintKey}
              onChange={handleBooleanConstraintsChange}
            />
          }
          disabled={isControlDisabled}
          label={
            <Typography sx={disabledLabelSx} variant="h6">
              {constraintKey}
            </Typography>
          }
          labelPlacement="start"
          sx={{ alignItems: 'center', justifyContent: 'space-between', m: 0, width: '100%' }}
        />

        {showAdvanced ? children : undefined}
      </FormGroup>
    </FormControl>
  );
};

export default BooleanConstraint;
