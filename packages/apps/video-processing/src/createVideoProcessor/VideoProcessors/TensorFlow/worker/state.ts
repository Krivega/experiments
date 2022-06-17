type TState = {
  algorithm?: string;
  segmentationThreshold?: string;
  edgeBlurAmount?: string;
  multiPersonDecoding?: string;
  scale?: string;
  architecture?: string;
  outputStride?: string;
  multiplier?: string;
  quantBytes?: string;
  internalResolution?: string;
};

const createState = () => {
  const state: TState = {};

  const getState = (): TState => {
    return state;
  };
  const getStateValue = (name: string): string | undefined => {
    return state[name];
  };
  const setStateValue = (name: string, value?: string) => {
    state[name] = value;
  };

  const initState = ({
    algorithm,
    segmentationThreshold,
    edgeBlurAmount,
    multiPersonDecoding,
    scale,
    architecture,
    outputStride,
    multiplier,
    quantBytes,
    internalResolution,
  }: TState) => {
    setStateValue('algorithm', algorithm);
    setStateValue('segmentationThreshold', segmentationThreshold);
    setStateValue('edgeBlurAmount', edgeBlurAmount);
    setStateValue('scale', scale);
    setStateValue('architecture', architecture);
    setStateValue('outputStride', outputStride);
    setStateValue('multiplier', multiplier);
    setStateValue('quantBytes', quantBytes);
    setStateValue('multiPersonDecoding', multiPersonDecoding);
    setStateValue('internalResolution', internalResolution);
  };

  return {
    getStateValue,
    getState,
    setStateValue,
    initState,
  };
};

export default createState;
