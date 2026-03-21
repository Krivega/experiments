/**
 * Scale viewPort from initial sizes
 *
 * @func
 * @category Function
 * @param {Object} sizes - sizes
 * @param {number} sizes.width - Initial width.
 * @param {number} sizes.height - Initial height.
 * @param {number} sizes.desiredWidth - Desired width.
 * @param {number} sizes.desiredHeight - Desired height.
 * @returns {Object} scaledViewport object with scaled width and height
 */
const getViewport = ({
  width,
  height,
  desiredWidth,
  desiredHeight,
}: {
  width: number;
  height: number;
  desiredWidth: number;
  desiredHeight: number;
}) => {
  const viewport = { width, height };
  const scaleWidth = Number(((desiredWidth || width) / width).toFixed(3));
  const scaleHeight = Number(((desiredHeight || height) / height).toFixed(3));
  const scale = scaleWidth < scaleHeight ? scaleWidth : scaleHeight;
  const scaledViewport = {
    scale,
    width: Math.floor(viewport.width * scale),
    height: Math.floor(viewport.height * scale),
  };

  return scaledViewport;
};

export default getViewport;
