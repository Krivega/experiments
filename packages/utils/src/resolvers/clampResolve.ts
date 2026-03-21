/**
 * limit the value between minimum and maximum
 * @param {number} min min
 * @param {number} max max

 * @returns {function(number): number} a function that accepts a single value parameter
 */
const clampResolve = (min: number, max: number) => {
  return (value: number) => {
    return Math.min(Math.max(value, min), max);
  };
};

export default clampResolve;
