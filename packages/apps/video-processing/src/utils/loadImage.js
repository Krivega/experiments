/**
 * Load image and return promise resolved object of Image
 *
 * @func
 * @category Function
 * @param {string} src - src of image
 * @returns {Promise} Promise object represents load of Image
 */
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };
    image.onerror = reject;

    image.src = src;
  });

export default loadImage;
