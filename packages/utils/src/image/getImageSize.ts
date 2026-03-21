import resize from './resize';

const getImageSize = ({
  image,
  desiredWidth,
  desiredHeight,
}: {
  image: HTMLImageElement;
  desiredWidth: number;
  desiredHeight: number;
}) => {
  const { width, height } = image;

  return resize({
    width,
    height,
    desiredWidth,
    desiredHeight,
  });
};

export default getImageSize;
