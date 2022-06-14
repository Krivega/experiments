import { imageBitmapToImageData, createPersonMask } from './render';

const estimateSegmentation = async (
  net,
  { imageData, algorithm, internalResolution, segmentationThreshold, multiPersonDecoding }
) => {
  switch (algorithm) {
    case 'multi-person-instance':
      return net.segmentMultiPerson(imageData, {
        segmentationThreshold,
        internalResolution,
        maxDetections: multiPersonDecoding.maxDetections,
        scoreThreshold: multiPersonDecoding.scoreThreshold,
        nmsRadius: multiPersonDecoding.nmsRadius,
        numKeypointForMatching: multiPersonDecoding.numKeypointForMatching,
        refineSteps: multiPersonDecoding.refineSteps,
      });
    case 'person':
      return net.segmentPerson(imageData, {
        segmentationThreshold,
        internalResolution,
        maxDetections: multiPersonDecoding.maxDetections,
        scoreThreshold: multiPersonDecoding.scoreThreshold,
        nmsRadius: multiPersonDecoding.nmsRadius,
      });
    default:
      return Promise.resolve(null);
  }
};

const bodySegmentation = async (
  net,
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

  /**
   * Feeds an image to BodyPix to estimate segmentation - this is where the
   * magic happens. This const loops with a requestAnimationFrame method.
   */
  const multiPersonSegmentation = await estimateSegmentation(net, {
    imageData,
    algorithm,
    internalResolution,
    segmentationThreshold,
    multiPersonDecoding,
  });

  if (Array.isArray(multiPersonSegmentation) && multiPersonSegmentation.length === 0) {
    return undefined;
  }

  const personMask = createPersonMask(multiPersonSegmentation, edgeBlurAmount);

  return personMask;
};

export default bodySegmentation;
