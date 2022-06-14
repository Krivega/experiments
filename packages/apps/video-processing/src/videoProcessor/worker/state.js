const createState = () => {
  const state = {};

  const getState = () => state;
  const getStateValue = (name) => state[name];
  const setStateValue = (name, value) => {
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
  }) => {
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
