import type { TAdvancedCapability } from './typings';

const getPanPosition = ({
  capabilities,
  currentPosition,
  panSpeed,
  isMoveToLeft,
}: {
  capabilities: TAdvancedCapability;
  currentPosition: number;
  panSpeed: number;
  isMoveToLeft: boolean;
}): number => {
  if (isMoveToLeft) {
    const newPanPosition = currentPosition - panSpeed;

    return Math.max(newPanPosition, capabilities.min);
  }

  const newPanPosition = currentPosition + panSpeed;

  return Math.min(newPanPosition, capabilities.max);
};

export default getPanPosition;
