import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as tensorflowBodySegmentation from '@tensorflow-models/body-segmentation';
import type { BodySegmenter } from '@tensorflow-models/body-segmentation/dist/body_segmenter';
import '@tensorflow/tfjs-converter';
import type { TModelSelection } from '../../../typings';
// import '@mediapipe/selfie_segmentation';
import { resetOffScreenCanvases } from './render';
import bodySegmentation from './bodySegmentation';
import createState from './state';

const { getState, initState, setStateValue } = createState();
let segmenter: BodySegmenter;

const model = tensorflowBodySegmentation.SupportedModels.MediaPipeSelfieSegmentation; // or 'BodyPix'|| MediaPipeSelfieSegmentation

const loadSegmenter = async ({ modelSelection }: { modelSelection: TModelSelection }) => {
  const segmenterConfig = {
    runtime: 'tfjs' as const, // or 'tfjs' mediapipe
    modelType: modelSelection, // or 'landscape'
  };

  segmenter = await tensorflowBodySegmentation.createSegmenter(model, segmenterConfig);
};

const init = ({ modelSelection }: { modelSelection: TModelSelection }) => {
  initState({
    modelSelection,
  });
  resetOffScreenCanvases();

  return loadSegmenter({ modelSelection });
};

const processVideo = (imageBitmap) => {
  return bodySegmentation(segmenter, {
    imageBitmap,
  });
};

const changeParams = ({ modelSelection }: { modelSelection: TModelSelection }) => {
  setStateValue('modelSelection', modelSelection);

  resetOffScreenCanvases();

  return loadSegmenter({ modelSelection });
};

export default { init, processVideo, changeParams };
