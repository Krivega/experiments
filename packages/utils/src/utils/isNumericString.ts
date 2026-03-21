const isStringOnlyNumbers = (value?: string) => {
  if (value === undefined) {
    return false;
  }

  const regex = /^\d+$/;

  return regex.test(value);
};

const isNumericString = (value?: number | string): boolean => {
  if (typeof value !== 'string') {
    return false;
  } // we only process strings!

  return (
    // to handle case inject xss: 999998<img%20src=“Random.gif”%20onerror=alert(document.domain)>
    isStringOnlyNumbers(value) &&
    // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)
    !Number.isNaN(value) &&
    !Number.isNaN(Number.parseFloat(value))
  ); // ...and ensure strings of whitespace fail
};

export default isNumericString;
