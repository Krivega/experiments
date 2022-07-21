import React, { useState, useEffect } from 'react';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { TVideoConstraints } from '../typings';

type TProps = {
  constraintKey: string;
  value: {
    type: string;
    default: number;
    disabled: boolean;
    defaultObj: { min: number; max: number; exact: number; ideal: number };
  };
  videoSettings: TVideoConstraints;
  setVideoSettings: (value: TVideoConstraints) => void;
};

const ASPECT_RATIO = 'aspectRatio';
const FRAME_RATE = 'frameRate';

const hasAspectRatio = (constraint: string): boolean => {
  return constraint === ASPECT_RATIO;
};

const hasFrameRate = (constraint: string): boolean => {
  return constraint === FRAME_RATE;
};

const getStep = (constraint: string): number => {
  let step = 5;

  if (hasAspectRatio(constraint)) {
    step = 0.1;
  }

  if (hasFrameRate(constraint)) {
    step = 1;
  }

  return step;
};

const NumericConstraint: React.FC<TProps> = ({
  value,
  constraintKey,
  videoSettings,
  setVideoSettings,
}) => {
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(+value.default.toFixed(3));

  useEffect(() => {
    if (Object.keys(videoSettings).length === 0) {
      setSliderValue(+value.default.toFixed(3));
    }
  }, [value.default, videoSettings]);

  const defaultMin = value.defaultObj.min;
  const defaultMax = value.defaultObj.max;
  const isAspectRatio = hasAspectRatio(constraintKey);
  const isFrameRate = hasFrameRate(constraintKey);
  const min = isAspectRatio ? +defaultMin.toFixed(3) : defaultMin;
  const max = isAspectRatio || isFrameRate ? +defaultMax.toFixed(3) : defaultMax;

  const marks = [
    { value: min, label: `${min}` },
    { value: max, label: `${max}` },
  ];

  const step = getStep(constraintKey);

  const resolveHandleChangeNumericConstraint = (constraint: string) => {
    return (advancedSettingKey?: string) => {
      return (event, val) => {
        setSliderValue(val);

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
      <Typography variant="h6">{constraintKey}</Typography>
      <FormControlLabel
        control={
          <Checkbox
            disabled={value.disabled}
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
          value={sliderValue}
          defaultValue={+value.default.toFixed(3)}
          getAriaValueText={(val) => {
            return val.toFixed(3);
          }}
          disabled={value.disabled}
          valueLabelDisplay="auto"
          step={step}
          min={min}
          max={max}
          marks={marks}
          onChange={handleChangeNumericConstraint()}
        />
      )}
      {isAdvanced &&
        Object.keys(value.defaultObj).map((keyAdvanced) => {
          return (
            <Slider
              key={keyAdvanced}
              aria-label={keyAdvanced}
              defaultValue={+value.default.toFixed(3)}
              getAriaValueText={(val) => {
                return val.toFixed(3);
              }}
              valueLabelDisplay="auto"
              step={step}
              min={min}
              max={max}
              marks={[{ value: (max - min) / 2, label: keyAdvanced }, ...marks]}
              onChange={handleChangeNumericConstraint(keyAdvanced)}
            />
          );
        })}
    </Box>
  );
};

export default NumericConstraint;
