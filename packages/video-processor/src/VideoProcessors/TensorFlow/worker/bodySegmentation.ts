/* eslint-disable @typescript-eslint/no-unused-vars */
import { createPersonMask, imageBitmapToImageData } from './render';

import type { BodySegmenter } from '@tensorflow-models/body-segmentation/dist/body_segmenter';

// const estimateSegmentation = async (
//   segmenter: BodySegmenter,
//   { imageData, algorithm, internalResolution, segmentationThreshold, multiPersonDecoding }
// ) => {
//   switch (algorithm) {
//     case 'multi-person-instance':
//       return segmenter.segmentMultiPerson(imageData, {
//         segmentationThreshold,
//         internalResolution,
//         maxDetections: multiPersonDecoding.maxDetections,
//         scoreThreshold: multiPersonDecoding.scoreThreshold,
//         nmsRadius: multiPersonDecoding.nmsRadius,
//         numKeypointForMatching: multiPersonDecoding.numKeypointForMatching,
//         refineSteps: multiPersonDecoding.refineSteps,
//       });
//     case 'person':
//       return segmenter.segmentPerson(imageData, {
//         segmentationThreshold,
//         internalResolution,
//         maxDetections: multiPersonDecoding.maxDetections,
//         scoreThreshold: multiPersonDecoding.scoreThreshold,
//         nmsRadius: multiPersonDecoding.nmsRadius,
//       });
//     default:
//       return Promise.resolve(null);
//   }
// };

const bodySegmentation = async (
  segmenter: BodySegmenter,
  {
    imageBitmap,
    algorithm,
    segmentationThreshold,
    internalResolution,
    multiPersonDecoding,
    edgeBlurAmount,
    scale,
  }: {
    imageBitmap: ImageBitmap;
    algorithm?: string;
    segmentationThreshold?: string;
    internalResolution?: string;
    multiPersonDecoding?: string;
    edgeBlurAmount?: number;
    scale?: number;
  },
) => {
  const imageData = imageBitmapToImageData(imageBitmap, scale ?? 1);

  const segmentation = await segmenter.segmentPeople(imageData);

  if (Array.isArray(segmentation) && segmentation.length === 0) {
    return undefined;
  }

  const personMask = createPersonMask(segmentation, edgeBlurAmount ?? 0);

  return personMask;
};

export default bodySegmentation;
