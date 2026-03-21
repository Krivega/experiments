export type TPlayFunction = (timeFloat: number, index: number, inputValue: number) => number;

const sin = (x: number, y: number): number => {
  return Math.sin(2 * Math.PI * x * y);
};

const resolvePlayFunction = ({
  toneStart,
  toneEnd,
  volume,
}: {
  toneStart: number;
  toneEnd: number;
  volume: number;
}): TPlayFunction => {
  return (timeFloat: number): number => {
    return (volume * (sin(toneStart, timeFloat) + sin(toneEnd, timeFloat))) / 2;
  };
};

export default resolvePlayFunction;
