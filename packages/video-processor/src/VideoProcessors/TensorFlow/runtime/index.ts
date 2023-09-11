import * as tensorflowBodySegmentation from '@tensorflow-models/body-segmentation';
import type { BodySegmenter } from '@tensorflow-models/body-segmentation/dist/body_segmenter';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-core';
import type { TModelSelection } from '../../../typings';
// import '@mediapipe/selfie_segmentation';
import bodySegmentation from './bodySegmentation';
import { resetOffScreenCanvases } from './render';
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
