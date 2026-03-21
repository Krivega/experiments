import Slider from '@mui/material/Slider';
import React, { useCallback } from 'react';

import ToggleButton from './ToggleButton';

type TPointOfInterest = { x: number; y: number };

type TProps = {
  trackSettings: MediaTrackSettings;
  constraintKey: string;
  value: {
    type: string;
    disabled: boolean;
    default: TPointOfInterest;
  };
  updateConstraints: (additionalConstraints: MediaTrackConstraints) => void;
  constraints: MediaTrackConstraints;
};

const PointOfInterestConstraint: React.FC<TProps> = ({
  value,
  trackSettings,
  constraintKey,
  constraints,
  updateConstraints,
}) => {
  const resolveHandlePointsOfInterest = (constraint: string) => {
    return (axis: keyof TPointOfInterest) => {
      return (_event: unknown, sliderValue: number) => {
        const prevUnknown: unknown = constraints[constraint as keyof MediaTrackConstraints];
        const base: TPointOfInterest =
          typeof prevUnknown === 'object' &&
          prevUnknown !== null &&
          'x' in prevUnknown &&
          'y' in prevUnknown
            ? { ...(prevUnknown as TPointOfInterest) }
            : { ...value.default };

        updateConstraints({
          [constraint]: { ...base, [axis]: sliderValue },
        });
      };
    };
  };

  const { x, y } = value.default;
  const handlePointsOfInterest = resolveHandlePointsOfInterest(constraintKey);

  const onInactive = useCallback(() => {
    updateConstraints({
      [constraintKey]: undefined,
    });
  }, [constraintKey, updateConstraints]);

  const onActive = useCallback(() => {
    updateConstraints({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      [constraintKey]: trackSettings[constraintKey],
    } as MediaTrackConstraints);
  }, [constraintKey, trackSettings, updateConstraints]);

  return (
    <ToggleButton
      disabled={value.disabled}
      title={constraintKey}
      onActive={onActive}
      onInactive={onInactive}
    >
      <Slider
        aria-label={constraintKey}
        defaultValue={x}
        disabled={value.disabled}
        getAriaValueText={(value_) => {
          return `${value_}`;
        }}
        marks={[{ value: 10, label: 'X' }]}
        max={100}
        min={10}
        step={10}
        valueLabelDisplay="auto"
        onChange={handlePointsOfInterest('x')}
      />

      <Slider
        aria-label={constraintKey}
        defaultValue={y}
        disabled={value.disabled}
        getAriaValueText={(value_) => {
          return `${value_}`;
        }}
        marks={[{ value: 10, label: 'Y' }]}
        max={100}
        min={10}
        step={10}
        valueLabelDisplay="auto"
        onChange={handlePointsOfInterest('y')}
      />
    </ToggleButton>
  );
};

export default PointOfInterestConstraint;
