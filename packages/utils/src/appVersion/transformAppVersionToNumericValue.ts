const transformAppVersionToNumericValue = (version: string): number[] => {
  return version
    .split('.')
    .map((versionString) => {
      return Number.parseInt(versionString, 10);
    })
    .filter((versionNumber) => {
      return Number.isInteger(versionNumber) && !Number.isNaN(versionNumber);
    });
};

export default transformAppVersionToNumericValue;
