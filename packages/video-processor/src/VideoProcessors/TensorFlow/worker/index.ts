import * as tensorflowBodySegmentation from '@tensorflow-models/body-segmentation';
import type { BodySegmenter } from '@tensorflow-models/body-segmentation/dist/body_segmenter';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-core';

// Uncomment the line below if you want to use TensorFlow.js runtime.
// import '@tensorflow/tfjs-converter';

// Uncomment the line below if you want to use MediaPipe runtime.
import '@mediapipe/selfie_segmentation';
import bodySegmentation from './bodySegmentation';
import api from './client-api';
import { resetOffScreenCanvases } from './render';
import createState from './state';

const { getState, initState, setStateValue } = createState();
let segmenter: BodySegmenter;

const model = tensorflowBodySegmentation.SupportedModels.MediaPipeSelfieSegmentation; // or 'BodyPix'

const segmenterConfig = {
  runtime: 'mediapipe', // or 'tfjs'
  modelType: 'general', // or 'landscape'
};

const loadBodyPix = async ({ architecture, outputStride, multiplier, quantBytes }) => {
  // @ts-ignore
  segmenter = await tensorflowBodySegmentation.createSegmenter(model, segmenterConfig);
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

  return loadBodyPix({ architecture, outputStride, multiplier, quantBytes }).then(() => {
    return {};
  });
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

  return bodySegmentation(segmenter, {
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

// @ts-ignore
api.init.onReceiveActionAndWaitConfirm(init);
api.processImage.onReceiveActionAndWaitConfirm(processVideo);
// @ts-ignore
api.changeParams.onReceiveActionAndWaitConfirm(changeParams);
