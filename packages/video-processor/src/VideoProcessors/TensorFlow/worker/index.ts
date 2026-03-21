import '@mediapipe/selfie_segmentation';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-core';
import * as tensorflowBodySegmentation from '@tensorflow-models/body-segmentation';

import bodySegmentation from './bodySegmentation';
import api from './client-api';
import { resetOffScreenCanvases } from './render';
import createState from './state';

import type { BodySegmenter } from '@tensorflow-models/body-segmentation/dist/body_segmenter';

const { getState, initState, setStateValue } = createState();
let segmenter: BodySegmenter;

const model = tensorflowBodySegmentation.SupportedModels.MediaPipeSelfieSegmentation; // or 'BodyPix'

const segmenterConfig = {
  runtime: 'mediapipe', // or 'tfjs'
  modelType: 'general', // or 'landscape'
};

const loadBodyPix = async (_params: {
  architecture: string;
  outputStride: string;
  multiplier: string;
  quantBytes: string;
}) => {
  // @ts-ignore
  segmenter = await tensorflowBodySegmentation.createSegmenter(model, segmenterConfig);
};

const init = async ({
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
}: {
  algorithm: string;
  segmentationThreshold: string;
  edgeBlurAmount: number;
  multiPersonDecoding: string;
  scale: number;
  architecture: string;
  outputStride: string;
  multiplier: string;
  quantBytes: string;
  internalResolution: string;
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

const processVideo = async (imageBitmap: ImageBitmap) => {
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

const changeParams = async ({
  algorithm,
  segmentationThreshold,
  internalResolution,
  multiPersonDecoding,
  edgeBlurAmount,
  scale,
}: {
  algorithm: string;
  segmentationThreshold: string;
  internalResolution: string;
  multiPersonDecoding: string;
  edgeBlurAmount: number;
  scale: number;
}) => {
  setStateValue('algorithm', algorithm);
  setStateValue('segmentationThreshold', segmentationThreshold);
  setStateValue('edgeBlurAmount', edgeBlurAmount);
  setStateValue('scale', scale);
  setStateValue('multiPersonDecoding', multiPersonDecoding);
  setStateValue('internalResolution', internalResolution);

  resetOffScreenCanvases();

  return {};
};

// @ts-expect-error
api.init.onReceiveActionAndWaitConfirm(init);
// @ts-expect-error
api.processImage.onReceiveActionAndWaitConfirm(processVideo);
// @ts-expect-error
api.changeParams.onReceiveActionAndWaitConfirm(changeParams);
