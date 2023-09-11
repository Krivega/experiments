import getBinary from './getBinary';
import logger from './logger';

const createWebAssembly = (file: string, importObject: WebAssembly.Imports) => {
  try {
    const binary = getBinary(file);
    const module = new WebAssembly.Module(binary);
    const instance = new WebAssembly.Instance(module, importObject);

    return instance;
  } catch (error) {
    const knownError = error as Error;
    const stringError = knownError.toString();

    logger(`failed to compile wasm module: ${stringError}`);

    if (stringError.includes('imported Memory') || stringError.includes('memory import')) {
      logger(
        'Memory size incompatibility issues may be due to changing INITIAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set INITIAL_MEMORY at runtime to something smaller than it was at compile time).',
      );
    }

    throw error;
  }
};

export default createWebAssembly;
