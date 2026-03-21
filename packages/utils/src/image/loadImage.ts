const loadImage = async (source: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.addEventListener('load', () => {
      resolve(image);
    });
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    image.onerror = reject;

    image.src = source;
  });
};

export default loadImage;
