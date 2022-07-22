import React from 'react';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import type { TClasses } from '../useStyles';

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

      if (name === key) {
        updateConstraints({
          [key]: checked,
        });
      } else if (name === 'exact') {
        updateConstraints({
          [key]: { exact: checked },
        });
      } else if (name === 'ideal') {
        updateConstraints({
          [key]: { ideal: checked },
        });
      }
    };
  };

  const handleBooleanConstraintsChange = resolveHandleBooleanConstraintsChange(constraintKey);

  const children = (
    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
      <FormControlLabel
        control={
          <Checkbox
            name="exact"
            size="small"
            onChange={handleBooleanConstraintsChange}
            checked={!!constraints[constraintKey]?.exact}
            color="default"
          />
        }
        label="exact"
      />
      <FormControlLabel
        control={
          <Checkbox
            name="ideal"
            size="small"
            onChange={handleBooleanConstraintsChange}
            checked={!!constraints[constraintKey]?.ideal}
            color="default"
          />
        }
        label="ideal"
      />
    </Box>
  );

  return (
    <FormControl variant="filled" className={classes.formControl}>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              disabled={value.disabled}
              name={constraintKey}
              onChange={handleBooleanConstraintsChange}
              checked={constraints[constraintKey] === true}
              color="default"
            />
          }
          label={<Typography variant="h6">{constraintKey}</Typography>}
        />
        {!!constraints[constraintKey] && children}
      </FormGroup>
    </FormControl>
  );
};

export default BooleanConstraint;
