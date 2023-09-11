import decodeBase64 from './decodeBase64';

const dataURIPrefix = 'data:application/octet-stream;base64,';

function intArrayFromBase64(s: string) {
  try {
    const decoded = decodeBase64(s);
    const bytes = new Uint8Array(decoded.length);

    for (let index = 0; index < decoded.length; ++index) {
      bytes[index] = decoded.charCodeAt(index);
    }

    return bytes;
  } catch {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

function parseAsDataURI(filename: string): Uint8Array | undefined {
  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}

function getBinary(file: string): Uint8Array {
  const binary = parseAsDataURI(file);

  if (binary) {
    return binary;
  }

  throw new Error(
    "sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)",
  );
}

export default getBinary;
