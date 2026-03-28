import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import React, { useState, useEffect, useCallback } from 'react';

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
  const [isAdvanced, setIsAdvanced] = useState(false);
  const defaultRounded = Number(value.default.toFixed(3));
  const [sliderValue, setSliderValue] = useState(defaultRounded);

  useEffect(() => {
    if (Object.keys(constraints).length === 0) {
      setSliderValue(defaultRounded);
    }
  }, [defaultRounded, constraints]);

  const defaultMin = value.defaultObj.min;
  const defaultMax = value.defaultObj.max;
  const defaultStep = value.defaultObj.step;
  const isAspectRatio = hasAspectRatio(constraintKey);
  const isFrameRate = hasFrameRate(constraintKey);
  const min = isAspectRatio ? Number(defaultMin.toFixed(3)) : defaultMin;
  let max = defaultMax;

  if (isFrameRate) {
    max = Number(defaultMax.toFixed(3));
  }

  if (isAspectRatio) {
    max = MAX_VAL_ASPECT_RATIO;
  }

  const marks = [
    { value: min, label: `${min}` },
    { value: max, label: `${max}` },
  ];

  const step = defaultStep ?? getStep(constraintKey);

  const resolveHandleChangeNumericConstraint = (constraint: string) => {
    return (advancedSettingKey?: string) => {
      return (_event: Event, value_: number | number[]) => {
        const nextValue = Array.isArray(value_) ? value_[0] : value_;

        setSliderValue(nextValue);

        if (nextValue === Math.round(value.defaultObj.min) && advancedSettingKey === undefined) {
          updateConstraints({
            [constraint]: undefined,
          });

          return;
        }

        if (advancedSettingKey !== undefined && nextValue === Math.round(value.defaultObj.min)) {
          let entries: [string, unknown][] = [];

          const currentUnknown: unknown = constraints[constraint as keyof MediaTrackConstraints];

          if (typeof currentUnknown === 'object' && currentUnknown !== null) {
            entries = Object.entries(currentUnknown as Record<string, unknown>).filter(([key]) => {
              return key !== advancedSettingKey;
            });
          }

          if (entries.length === 0) {
            updateConstraints({
              [constraint]: undefined,
            });

            return;
          }

          updateConstraints({
            [constraint]: { ...Object.fromEntries(entries) },
          });

          return;
        }

        if (advancedSettingKey === undefined) {
          updateConstraints({
            [constraint]: nextValue,
          });

          return;
        }

        const baseUnknown: unknown = constraints[constraint as keyof MediaTrackConstraints];
        const base: Record<string, number> =
          typeof baseUnknown === 'object' && baseUnknown !== null
            ? { ...(baseUnknown as Record<string, number>) }
            : {};

        updateConstraints({
          [constraint]: { ...base, [advancedSettingKey]: nextValue },
        });
      };
    };
  };

  const handleChangeNumericConstraint = resolveHandleChangeNumericConstraint(constraintKey);

  const onInactive = useCallback(() => {
    setSliderValue(defaultRounded);
    updateConstraints({
      [constraintKey]: undefined,
    });
  }, [constraintKey, updateConstraints, defaultRounded]);

  const onActive = useCallback(() => {
    const key = constraintKey as keyof MediaTrackSettings;
    const raw = trackSettings[key];

    if (typeof raw === 'number') {
      setSliderValue(Number(raw.toFixed(3)));
    }

    updateConstraints({
      [constraintKey]: raw,
    } as MediaTrackConstraints);
  }, [constraintKey, trackSettings, updateConstraints]);

  return (
    <ToggleButton
      disabled={value.disabled}
      title={constraintKey}
      onActive={onActive}
      onInactive={onInactive}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={isAdvanced}
            color="default"
            disabled={value.disabled}
            size="small"
            onChange={({ target: { checked } }) => {
              setIsAdvanced(checked);
            }}
          />
        }
        label="advanced"
      />

      {!isAdvanced && (
        <Slider
          aria-label={constraintKey}
          defaultValue={defaultRounded}
          disabled={value.disabled}
          getAriaValueText={(value_) => {
            return value_.toFixed(3);
          }}
          marks={marks}
          max={max}
          min={min}
          step={step}
          value={sliderValue}
          valueLabelDisplay="auto"
          onChange={handleChangeNumericConstraint()}
        />
      )}

      {isAdvanced
        ? Object.keys(value.defaultObj).map((keyAdvanced) => {
            return (
              <Slider
                aria-label={keyAdvanced}
                defaultValue={defaultRounded}
                getAriaValueText={(value_) => {
                  return value_.toFixed(3);
                }}
                key={keyAdvanced}
                marks={[{ value: (max - min) / 2, label: keyAdvanced }, ...marks]}
                max={max}
                min={min}
                step={step}
                valueLabelDisplay="auto"
                onChange={handleChangeNumericConstraint(keyAdvanced)}
              />
            );
          })
        : undefined}
    </ToggleButton>
  );
};

export default NumericConstraint;
