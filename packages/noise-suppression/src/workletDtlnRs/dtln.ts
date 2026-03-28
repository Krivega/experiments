// eslint-disable-next-line import/no-relative-packages
import dtlnWasmUrl from '../../node_modules/dtln-rs/dtln_rs.wasm?url';

export interface DtlnModule {
  dtln_create: () => Promise<number>;
  dtln_destroy: (handle: number) => Promise<void>;
  dtln_denoise: (handle: number, input: Float32Array, output: Float32Array) => Promise<boolean>;
}

type TWasmExports = {
  memory: WebAssembly.Memory;
  __indirect_function_table: WebAssembly.Table;
  dtln_create_wasm: () => number;
  dtln_get_audio_buffer: (handle: number) => number;
  dtln_denoise_wasm: (handle: number) => void;
  dtln_destroy_wasm: (handle: number) => void;
  _initialize?: () => void;
};

type TFunctionArgument = bigint | number;

let dtlnModulePromise: Promise<DtlnModule> | undefined;

const DATA_URL_PREFIX = 'data:application/wasm;base64,';

function createRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  const maybeCrypto = (globalThis as Record<string, unknown>).crypto;
  const maybeGetRandomValues =
    typeof maybeCrypto === 'object' && maybeCrypto !== null
      ? (maybeCrypto as Record<string, unknown>).getRandomValues
      : undefined;

  if (typeof maybeGetRandomValues === 'function') {
    (maybeGetRandomValues as (view: Uint8Array) => unknown)(bytes);

    return bytes;
  }

  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }

  return bytes;
}

function getMemoryViews(memory: WebAssembly.Memory) {
  return {
    dataView: new DataView(memory.buffer),
    float32: new Float32Array(memory.buffer),
    uint8: new Uint8Array(memory.buffer),
  };
}

function decodeBase64(base64: string): Uint8Array {
  const availableAtob = globalThis.atob;

  if (typeof availableAtob === 'function') {
    const binaryString = availableAtob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let index = 0; index < binaryString.length; index += 1) {
      bytes[index] = binaryString.codePointAt(index) ?? 0;
    }

    return bytes;
  }

  const normalizedBase64 = base64.replaceAll(/\s+/g, '');
  let paddingLength = 0;

  if (normalizedBase64.endsWith('==')) {
    paddingLength = 2;
  } else if (normalizedBase64.endsWith('=')) {
    paddingLength = 1;
  }

  const outputLength = (normalizedBase64.length * 3) / 4 - paddingLength;
  const bytes = new Uint8Array(outputLength);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  let outputIndex = 0;

  for (let index = 0; index < normalizedBase64.length; index += 4) {
    const encodedChunk = normalizedBase64.slice(index, index + 4).padEnd(4, 'A');
    const value1 = alphabet.indexOf(encodedChunk[0]);
    const value2 = alphabet.indexOf(encodedChunk[1]);
    const value3 = encodedChunk[2] === '=' ? 0 : alphabet.indexOf(encodedChunk[2]);
    const value4 = encodedChunk[3] === '=' ? 0 : alphabet.indexOf(encodedChunk[3]);

    if (value1 < 0 || value2 < 0 || value3 < 0 || value4 < 0) {
      throw new Error('Invalid base64-encoded DTLN wasm payload.');
    }

    const combinedValue = value1 * 2 ** 18 + value2 * 2 ** 12 + value3 * 2 ** 6 + value4;

    if (outputIndex < outputLength) {
      bytes[outputIndex] = Math.floor(combinedValue / 65_536);
      outputIndex += 1;
    }

    if (outputIndex < outputLength) {
      bytes[outputIndex] = Math.floor((combinedValue % 65_536) / 256);
      outputIndex += 1;
    }

    if (outputIndex < outputLength) {
      bytes[outputIndex] = combinedValue % 256;
      outputIndex += 1;
    }
  }

  return bytes;
}

async function getWasmBytes(): Promise<Uint8Array> {
  if (dtlnWasmUrl.startsWith(DATA_URL_PREFIX)) {
    return decodeBase64(dtlnWasmUrl.slice(DATA_URL_PREFIX.length));
  }

  const response = await fetch(dtlnWasmUrl);

  if (!response.ok) {
    throw new TypeError(`Failed to fetch DTLN wasm: ${response.status} ${response.statusText}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());

  return bytes;
}

function getWasmInstance(
  instantiated: WebAssembly.Instance | WebAssembly.WebAssemblyInstantiatedSource,
): WebAssembly.Instance {
  if (instantiated instanceof WebAssembly.Instance) {
    return instantiated;
  }

  return instantiated.instance;
}

function createInvokeReturningNumber(
  getTable: () => WebAssembly.Table | undefined,
): (functionIndex: number, ...arguments_: TFunctionArgument[]) => number {
  return (functionIndex: number, ...arguments_: TFunctionArgument[]) => {
    const functionTable = getTable();
    const functionPointer: unknown = functionTable?.get(functionIndex);

    if (typeof functionPointer !== 'function') {
      return 0;
    }

    return (functionPointer as (...args: TFunctionArgument[]) => number)(...arguments_);
  };
}

function createInvokeReturningUndefined(
  getTable: () => WebAssembly.Table | undefined,
): (functionIndex: number, ...arguments_: TFunctionArgument[]) => undefined {
  return (functionIndex: number, ...arguments_: TFunctionArgument[]) => {
    const functionTable = getTable();
    const functionPointer: unknown = functionTable?.get(functionIndex);

    if (typeof functionPointer !== 'function') {
      return undefined;
    }

    (functionPointer as (...args: TFunctionArgument[]) => void)(...arguments_);

    return undefined;
  };
}

function createWasiImports(getMemory: () => WebAssembly.Memory | undefined) {
  return {
    clock_time_get: (_clockId: number, _precision: bigint, timePointer: number) => {
      const memory = getMemory();

      if (memory !== undefined) {
        getMemoryViews(memory).dataView.setBigUint64(
          timePointer,
          BigInt(Date.now()) * BigInt(1_000_000),
          true,
        );
      }

      return 0;
    },
    environ_get: () => {
      return 0;
    },
    environ_sizes_get: (countPointer: number, bufferSizePointer: number) => {
      const memory = getMemory();

      if (memory !== undefined) {
        const { dataView } = getMemoryViews(memory);

        dataView.setUint32(countPointer, 0, true);
        dataView.setUint32(bufferSizePointer, 0, true);
      }

      return 0;
    },
    fd_close: () => {
      return 0;
    },
    fd_seek: (...args: [number, bigint, number, number]) => {
      const newOffsetPointer = args[3];
      const memory = getMemory();

      if (memory !== undefined) {
        getMemoryViews(memory).dataView.setBigUint64(newOffsetPointer, BigInt(0), true);
      }

      return 0;
    },
    fd_write: (...args: [number, number, number, number]) => {
      const ioVectorPointer = args[1];
      const ioVectorLength = args[2];
      const writtenPointer = args[3];
      const memory = getMemory();

      if (memory === undefined) {
        return 0;
      }

      const { dataView } = getMemoryViews(memory);
      let writtenBytes = 0;

      for (let index = 0; index < ioVectorLength; index += 1) {
        const currentPointer = ioVectorPointer + index * 8;
        const dataLength = dataView.getUint32(currentPointer + 4, true);

        writtenBytes += dataLength;
      }

      dataView.setUint32(writtenPointer, writtenBytes, true);

      return 0;
    },
    proc_exit: (code: number) => {
      throw new Error(`dtln wasm requested proc_exit(${code})`);
    },
    random_get: (bufferPointer: number, bufferLength: number) => {
      const memory = getMemory();

      if (memory !== undefined) {
        getMemoryViews(memory)
          .uint8.subarray(bufferPointer, bufferPointer + bufferLength)
          .set(createRandomBytes(bufferLength));
      }

      return 0;
    },
  };
}

function createEnvImports(
  getTable: () => WebAssembly.Table | undefined,
  getMemory: () => WebAssembly.Memory | undefined,
) {
  const invokeReturningNumber = createInvokeReturningNumber(getTable);
  const invokeReturningUndefined = createInvokeReturningUndefined(getTable);

  const invokeWithNumber = (...args: TFunctionArgument[]) => {
    const functionIndex = args[0] as number;

    return invokeReturningNumber(functionIndex, ...args.slice(1));
  };

  const invokeWithUndefined = (...args: TFunctionArgument[]) => {
    const functionIndex = args[0] as number;

    invokeReturningUndefined(functionIndex, ...args.slice(1));

    return undefined;
  };

  return {
    __cxa_begin_catch: (pointer: number) => {
      return pointer;
    },
    __cxa_find_matching_catch_2: () => {
      return 0;
    },
    __cxa_find_matching_catch_3: () => {
      return 0;
    },
    __cxa_throw: (...arguments_: TFunctionArgument[]) => {
      throw new Error(`dtln wasm __cxa_throw(${arguments_.join(', ')})`);
    },
    __resumeException: (...arguments_: TFunctionArgument[]) => {
      throw new Error(`dtln wasm __resumeException(${arguments_.join(', ')})`);
    },
    __syscall_getcwd: (bufferPointer: number, bufferLength: number) => {
      const memory = getMemory();

      if (memory === undefined || bufferLength < 2) {
        return -1;
      }

      const { uint8 } = getMemoryViews(memory);

      uint8[bufferPointer] = '/'.codePointAt(0) ?? 47;
      uint8[bufferPointer + 1] = 0;

      return bufferPointer;
    },
    invoke_fff: invokeWithNumber,
    invoke_i: invokeWithNumber,
    invoke_ii: invokeWithNumber,
    invoke_iii: invokeWithNumber,
    invoke_iiii: invokeWithNumber,
    invoke_iiiii: invokeWithNumber,
    invoke_iiiiii: invokeWithNumber,
    invoke_iiiiiiii: invokeWithNumber,
    invoke_ij: invokeWithNumber,
    invoke_j: invokeWithNumber,
    invoke_v: invokeWithUndefined,
    invoke_vi: invokeWithUndefined,
    invoke_vii: invokeWithUndefined,
    invoke_viii: invokeWithUndefined,
    invoke_viiii: invokeWithUndefined,
    invoke_viiiii: invokeWithUndefined,
    invoke_viiiiii: invokeWithUndefined,
    invoke_viiiiiii: invokeWithUndefined,
    invoke_viiiiiiii: invokeWithUndefined,
    invoke_viiji: invokeWithUndefined,
    invoke_vij: invokeWithUndefined,
    invoke_vijjjj: invokeWithUndefined,
  };
}

function isDtlnExports(value: WebAssembly.Exports): value is TWasmExports {
  const record = value as Record<string, unknown>;
  const indirectFunctionTable: unknown = Reflect.get(record, '__indirect_function_table');
  const initializeValue: unknown = Reflect.get(record, '_initialize');

  return (
    record.memory instanceof WebAssembly.Memory &&
    indirectFunctionTable instanceof WebAssembly.Table &&
    typeof record.dtln_create_wasm === 'function' &&
    typeof record.dtln_get_audio_buffer === 'function' &&
    typeof record.dtln_denoise_wasm === 'function' &&
    typeof record.dtln_destroy_wasm === 'function' &&
    (initializeValue === undefined || typeof initializeValue === 'function')
  );
}

async function createDtlnModule(): Promise<DtlnModule> {
  const bytes = await getWasmBytes();

  let wasmMemory: WebAssembly.Memory | undefined;
  let wasmTable: WebAssembly.Table | undefined;

  const instantiated = await WebAssembly.instantiate(bytes, {
    env: createEnvImports(
      () => {
        return wasmTable;
      },
      () => {
        return wasmMemory;
      },
    ),
    wasi_snapshot_preview1: createWasiImports(() => {
      return wasmMemory;
    }),
  });
  const instance = getWasmInstance(instantiated);

  const instanceExports = instance.exports;

  if (!isDtlnExports(instanceExports)) {
    throw new TypeError('Unexpected dtln wasm exports.');
  }

  const exports = instanceExports;

  wasmMemory = exports.memory;

  const indirectFunctionTable: unknown = Reflect.get(exports, '__indirect_function_table');

  if (!(indirectFunctionTable instanceof WebAssembly.Table)) {
    throw new TypeError('Unexpected dtln wasm indirect function table type.');
  }

  wasmTable = indirectFunctionTable;

  const initializeValue: unknown = Reflect.get(exports, '_initialize');

  if (typeof initializeValue === 'function') {
    (initializeValue as () => void)();
  }

  return {
    dtln_create: async () => {
      return exports.dtln_create_wasm();
    },
    dtln_denoise: async (handle: number, input: Float32Array, output: Float32Array) => {
      const heapFloat32 = new Float32Array(exports.memory.buffer);
      const audioBufferPointer = exports.dtln_get_audio_buffer(handle) / 4;

      heapFloat32.set(input, audioBufferPointer);
      exports.dtln_denoise_wasm(handle);
      output.set(heapFloat32.subarray(audioBufferPointer, audioBufferPointer + 512));

      return false;
    },
    dtln_destroy: async (handle: number) => {
      exports.dtln_destroy_wasm(handle);
    },
  };
}

export default async function initDTLN(): Promise<DtlnModule> {
  dtlnModulePromise ??= createDtlnModule();

  return dtlnModulePromise;
}
