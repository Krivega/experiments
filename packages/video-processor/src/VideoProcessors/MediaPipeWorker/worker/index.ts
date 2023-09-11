import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import api from './client-api';
import { resetOffScreenCanvases } from './render';
import createState from './state';

import type { TParams } from './typings';

const { getState, initState, setStateValue } = createState();

const selfieSegmentation = new SelfieSegmentation({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
  },
});

const updateOptions = () => {
  const { modelSelection } = getState();

  const GENERAL = 0;
  const LANDSCAPE = 1;

  selfieSegmentation.setOptions({
    modelSelection: modelSelection === 'general' ? GENERAL : LANDSCAPE,
  });
};

const init = ({ modelSelection }: TParams) => {
  initState({
    modelSelection,
  });
  resetOffScreenCanvases();
  updateOptions();

  return Promise.resolve({});
  // return loadBodyPix({ modelSelection }).then(() => {
  //   return {};
  // });
};

const processVideo = (imageBitmap: ImageBitmap) => {
  // @ts-ignore
  return selfieSegmentation.send({ image: imageBitmap }).then(() => {
    return { payload: undefined };
  });
};

const changeParams = ({ modelSelection }: TParams) => {
  setStateValue('modelSelection', modelSelection);
  resetOffScreenCanvases();
  updateOptions();

  return Promise.resolve({});
};

api.init.onReceiveActionAndWaitConfirm(init);
api.processImage.onReceiveActionAndWaitConfirm(processVideo);
api.changeParams.onReceiveActionAndWaitConfirm(changeParams);
