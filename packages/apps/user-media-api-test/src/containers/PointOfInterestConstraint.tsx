import React from 'react';
import Box from '@material-ui/core/Box';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import { TVideoConstraints } from '../typings';

type TProps = {
  constraintKey: string;
  value: {
    type: string;
    disabled: boolean;
    default: { x: number; y: number };
  };
  setVideoSettings: (value: TVideoConstraints) => void;
  videoSettings: TVideoConstraints;
};

const PointOfInterestConstraint: React.FC<TProps> = ({
  value,
  constraintKey,
  videoSettings,
  setVideoSettings,
}) => {
  const resolveHandlePointsOfInterest = (constraint: string) => {
    return (axis: string) => {
      return (event, sliderValue) => {
        setVideoSettings({
          ...videoSettings,
          [constraint]: { ...videoSettings[constraint], [axis]: sliderValue },
        });
      };
    };
  };

  const { x, y } = value.default;
  const handlePointsOfInterest = resolveHandlePointsOfInterest(constraintKey);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3, width: 250 }}>
      <Typography variant="h6">{constraintKey}</Typography>
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
    </Box>
  );
};

export default PointOfInterestConstraint;
