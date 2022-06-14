import * as bodyPix from '@tensorflow-models/body-pix';
import {
  handleInitActionToClient,
  handleProcessActionToClient,
  handleChangeParamsActionToClient,
} from './client-api';
import { resetOffScreenCanvases } from './render';
import bodySegmentation from './bodySegmentation';
import createState from './state';

const { getState, initState, setStateValue } = createState();
let net;

const loadBodyPix = async ({ architecture, outputStride, multiplier, quantBytes }) => {
  net = await bodyPix.load({
    architecture,
    multiplier,
    quantBytes: +quantBytes,
    outputStride: +outputStride,
  });
};

const init = ({
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
  initState({
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
  });
  resetOffScreenCanvases();

  return loadBodyPix({ architecture, outputStride, multiplier, quantBytes });
};

const processVideo = (imageBitmap) => {
  const {
    algorithm,
    segmentationThreshold,
    internalResolution,
    multiPersonDecoding,
    edgeBlurAmount,
    scale,
  } = getState();

  return bodySegmentation(net, {
    imageBitmap,
    algorithm,
    segmentationThreshold,
    internalResolution,
    multiPersonDecoding,
    edgeBlurAmount,
    scale,
  }).then((imageBitmapPersonMask) => {
    return { payload: imageBitmapPersonMask, transfer: [imageBitmapPersonMask] };
  });
};

const changeParams = ({
  algorithm,
  segmentationThreshold,
  internalResolution,
  multiPersonDecoding,
  edgeBlurAmount,
  scale,
}) => {
  setStateValue('algorithm', algorithm);
  setStateValue('segmentationThreshold', segmentationThreshold);
  setStateValue('edgeBlurAmount', edgeBlurAmount);
  setStateValue('scale', scale);
  setStateValue('multiPersonDecoding', multiPersonDecoding);
  setStateValue('internalResolution', internalResolution);

  resetOffScreenCanvases();

  return Promise.resolve({});
};

handleInitActionToClient(init);
handleProcessActionToClient(processVideo);
handleChangeParamsActionToClient(changeParams);
