import React, { useState, useEffect, useCallback } from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Slider from '@material-ui/core/Slider';
import ToggleButton from './ToggleButton';

type TProps = {
  trackSettings: MediaTrackSettings;
  constraintKey: string;
  value: {
    type: string;
    default: number;
    disabled: boolean;
    defaultObj: { min: number; max: number; exact: number; ideal: number; step?: number };
  };
  constraints: MediaTrackConstraints;
  updateConstraints: (additionalConstraints: MediaTrackConstraints) => void;
};

const MAX_VAL_ASPECT_RATIO = 10;
const STEP_VAL_ASPECT_RATIO = 0.05;
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
    step = STEP_VAL_ASPECT_RATIO;
  }

  if (hasFrameRate(constraint)) {
    step = 1;
  }

  return step;
};

const NumericConstraint: React.FC<TProps> = ({
  value,
  constraintKey,
  constraints,
  updateConstraints,
  trackSettings,
}) => {
  const [isAdvanced, setIsAdvanced] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(+value.default.toFixed(3));

  useEffect(() => {
    if (Object.keys(constraints).length === 0) {
      setSliderValue(+value.default.toFixed(3));
    }
  }, [value.default, constraints]);

  const defaultMin = value.defaultObj.min;
  const defaultMax = value.defaultObj.max;
  const defaultStep = value.defaultObj.step;
  const isAspectRatio = hasAspectRatio(constraintKey);
  const isFrameRate = hasFrameRate(constraintKey);
  const min = isAspectRatio ? +defaultMin.toFixed(3) : defaultMin;
  let max = defaultMax;

  if (isFrameRate) {
    max = +defaultMax.toFixed(3);
  }

  if (isAspectRatio) {
    max = MAX_VAL_ASPECT_RATIO;
  }

  const marks = [
    { value: min, label: `${min}` },
    { value: max, label: `${max}` },
  ];

  const step = defaultStep || getStep(constraintKey);

  const resolveHandleChangeNumericConstraint = (constraint: string) => {
    return (advancedSettingKey?: string) => {
      return (event, val) => {
        setSliderValue(val);

        if (val === Math.round(value.defaultObj.min) && !advancedSettingKey) {
          return updateConstraints({
            [constraint]: undefined,
          });
        }

        if (advancedSettingKey && val === Math.round(value.defaultObj.min)) {
          let entries: [string, unknown][] = [];

          if (typeof constraints[constraint] === 'object') {
            entries = Object.entries(constraints[constraint]).filter(([key]) => {
              return key !== advancedSettingKey;
            });
          }

          if (entries.length === 0) {
            return updateConstraints({
              [constraint]: undefined,
            });
          }

          return updateConstraints({
            [constraint]: { ...Object.fromEntries(entries) },
          });
        }

        if (!advancedSettingKey) {
          return updateConstraints({
            [constraint]: val,
          });
        }

        return updateConstraints({
          [constraint]: { ...constraints[constraint], [advancedSettingKey]: val },
        });
      };
    };
  };

  const handleChangeNumericConstraint = resolveHandleChangeNumericConstraint(constraintKey);

  const onInactive = useCallback(() => {
    setSliderValue(+value.default.toFixed(3));
    updateConstraints({
      [constraintKey]: undefined,
    });
  }, [constraintKey, updateConstraints, value.default]);

  const onActive = useCallback(() => {
    if (trackSettings[constraintKey]) {
      setSliderValue(+trackSettings[constraintKey].toFixed(3));
    }

    updateConstraints({
      [constraintKey]: trackSettings[constraintKey],
    });
  }, [constraintKey, trackSettings, updateConstraints]);

  return (
    <ToggleButton
      title={constraintKey}
      disabled={value.disabled}
      onActive={onActive}
      onInactive={onInactive}
    >
      <FormControlLabel
        control={
          <Checkbox
            disabled={value.disabled}
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
    </ToggleButton>
  );
};

export default NumericConstraint;
