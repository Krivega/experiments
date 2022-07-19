import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Slider from '@material-ui/core/Slider';
import { TVideoConstraints } from '../typings';

const NumericConstraint = ({
  value,
  constraintKey,
  videoSettings,
  setVideoSettings,
}: {
  constraintKey: string;
  value: {
    type: string;
    default: number;
    defaultObj: { min: number; max: number; exact: number; ideal: 0 };
  };
  setVideoSettings: (value: TVideoConstraints) => void;
  videoSettings: TVideoConstraints;
}) => {
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);

  const resolveHandleChangeNumericConstraint = (constraint: string) => {
    return (advancedSettingKey?: string) => {
      return (event, val) => {
        if (!advancedSettingKey) {
          return setVideoSettings({
            ...videoSettings,
            [constraint]: val,
          });
        }

        return setVideoSettings({
          ...videoSettings,
          [constraint]: { ...videoSettings[constraint], [advancedSettingKey]: val },
        });
      };
    };
  };

  const handleChangeNumericConstraint = resolveHandleChangeNumericConstraint(constraintKey);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3, width: 250 }}>
      <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{constraintKey}</div>
      <FormControlLabel
        control={
          <Checkbox
            name={constraintKey}
            size="small"
            onChange={({ target: { checked } }) => {
              setIsAdvanced(checked);
            }}
            checked={isAdvanced}
            color="default"
          />
        }
        label="advanced"
      />
      {!isAdvanced && (
        <Slider
          aria-label={constraintKey}
          defaultValue={+value.default}
          getAriaValueText={(val) => {
            return `${val}`;
          }}
          valueLabelDisplay="auto"
          step={10}
          min={10}
          max={100}
          onChange={handleChangeNumericConstraint()}
        />
      )}
      {isAdvanced &&
        Object.keys(value.defaultObj).map((keyAdvanced) => {
          return (
            <Slider
              key={keyAdvanced}
              aria-label={keyAdvanced}
              defaultValue={+value.default}
              getAriaValueText={(val) => {
                return `${val}`;
              }}
              valueLabelDisplay="auto"
              step={10}
              min={10}
              max={100}
              marks={[{ value: 10, label: keyAdvanced }]}
              onChange={handleChangeNumericConstraint(keyAdvanced)}
            />
          );
        })}
    </Box>
  );
};

export default NumericConstraint;
