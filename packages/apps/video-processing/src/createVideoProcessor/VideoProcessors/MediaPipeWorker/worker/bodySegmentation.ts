import type { BodySegmenter } from '@tensorflow-models/body-segmentation/dist/body_segmenter';
import { imageBitmapToImageData, createPersonMask } from './render';

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
  }
) => {
  const imageData = imageBitmapToImageData(imageBitmap, scale);

  const segmentation = await segmenter.segmentPeople(imageData);

  if (Array.isArray(segmentation) && segmentation.length === 0) {
    return undefined;
  }

  const personMask = createPersonMask(segmentation, edgeBlurAmount);

  return personMask;
};

export default bodySegmentation;
