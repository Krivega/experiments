type TState = {
  algorithm?: string;
  segmentationThreshold?: string;
  edgeBlurAmount?: number;
  multiPersonDecoding?: string;
  scale?: number;
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
  const getStateValue = (name: keyof TState) => {
    return state[name as keyof TState];
  };
  const setStateValue = <K extends keyof TState>(name: K, value?: TState[K]) => {
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
