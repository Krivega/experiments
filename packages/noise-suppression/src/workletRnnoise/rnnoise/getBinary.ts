import decodeBase64 from './decodeBase64';

const dataURIPrefix = 'data:application/octet-stream;base64,';

function intArrayFromBase64(s: string) {
  try {
    const decoded = decodeBase64(s);
    const bytes = new Uint8Array(decoded.length);

    for (let index = 0; index < decoded.length; ++index) {
      // eslint-disable-next-line unicorn/prefer-code-point
      bytes[index] = decoded.charCodeAt(index);
    }

    return bytes;
  } catch {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

function parseAsDataURI(filename: string) {
  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}

function getBinary(file: string) {
  return parseAsDataURI(file);
}

export default getBinary;
