import React, { useCallback } from 'react';
import Slider from '@material-ui/core/Slider';
import ToggleButton from './ToggleButton';

type TProps = {
  trackSettings: MediaTrackSettings;
  constraintKey: string;
  value: {
    type: string;
    disabled: boolean;
    default: { x: number; y: number };
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
    return (axis: string) => {
      return (event, sliderValue) => {
        updateConstraints({
          [constraint]: { ...constraints[constraint], [axis]: sliderValue },
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
      <Slider
        aria-label={constraintKey}
        defaultValue={x}
        getAriaValueText={(val) => {
          return `${val}`;
        }}
        disabled={value.disabled}
        valueLabelDisplay="auto"
        step={10}
        min={10}
        max={100}
        marks={[{ value: 10, label: 'X' }]}
        onChange={handlePointsOfInterest('x')}
      />
      <Slider
        aria-label={constraintKey}
        defaultValue={y}
        getAriaValueText={(val) => {
          return `${val}`;
        }}
        disabled={value.disabled}
        valueLabelDisplay="auto"
        step={10}
        min={10}
        max={100}
        marks={[{ value: 10, label: 'Y' }]}
        onChange={handlePointsOfInterest('y')}
      />
    </ToggleButton>
  );
};

export default PointOfInterestConstraint;
