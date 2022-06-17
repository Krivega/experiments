import type { BodySegmenter } from '@tensorflow-models/body-segmentation/dist/body_segmenter';
import { createPersonMask } from './render';

const bodySegmentation = async (segmenter: BodySegmenter, { imageBitmap }) => {
  const segmentation = await segmenter.segmentPeople(imageBitmap);

  if (Array.isArray(segmentation) && segmentation.length === 0) {
    return undefined;
  }

  const personMask = createPersonMask(segmentation);

  return personMask;
};

export default bodySegmentation;
