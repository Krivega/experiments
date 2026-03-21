const resizeCover = ({
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
  const scaleWidth = desiredWidth / width;
  const scaleHeight = desiredHeight / height;
  const scale = Math.max(scaleWidth, scaleHeight);

  let size = { width, height, scale: 1 };

  if (scale !== 1) {
    size = {
      scale,
      width: Math.floor(width * scale),
      height: Math.floor(height * scale),
    };
  }

  return {
    x: (desiredWidth - size.width) / 2,
    y: (desiredHeight - size.height) / 2,
    ...size,
  };
};

export default resizeCover;
