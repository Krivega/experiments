/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-bitwise */
import createWebAssembly from './createWebAssembly';
import getAbortedError from './getAbortedError';
import logger from './logger';
import wasmBinaryFile from './wasmBinaryFile';

function getHeapMax() {
  return 2_147_483_648;
}

const alignUp = (x: number, multiple: number) => {
  return x + ((multiple - (x % multiple)) % multiple);
};

type TAsm = WebAssembly.Exports & {
  c: WebAssembly.Memory;
  e: () => void;
  f: () => number;
  h: (context: number) => void;
  g: (context: number) => number;
  j: (context: number, input: number, output: number) => number;
  i: (context: number) => void;
};

class Rnnoise {
  public HEAPF32: Float32Array = new Float32Array();

  private buffer?: ArrayBuffer;

  private HEAPU8?: Uint8Array;

  private readonly atInit: WebAssembly.ExportValue[] = [];

  private readonly asm: TAsm;

  public constructor() {
    try {
      this.asm = this.createWasm();
      this.initRuntime();
    } catch (error) {
      const knownError = error as Error;
      const abortedError = getAbortedError(knownError);
      const runtimeError = new WebAssembly.RuntimeError(abortedError.message);

      throw runtimeError;
    }
  }

  private get wasmMemory() {
    return this.asm.c;
  }

  private get wasmMemoryBuffer() {
    return this.wasmMemory.buffer;
  }

  public rnnoiseInit = (): void => {
    this.asm.e();
  };

  public rnnoiseCreate = (): number => {
    return this.asm.f();
  };

  public rnnoiseDestroy = (context: number): void => {
    this.asm.h(context);
  };

  public malloc = (context: number): number => {
    return this.asm.g(context);
  };

  public rnnoiseProcessFrame = (context: number, input: number, output: number): number => {
    return this.asm.j(context, input, output);
  };

  public free = (context: number): void => {
    this.asm.i(context);
  };

  private createWasm(): TAsm {
    const asmLibraryArgument = {
      b: this.emscriptenMemcpyBig,
      a: this.emscriptenResizeHeap,
    };
    const importObject = {
      a: asmLibraryArgument,
    };

    const instance = createWebAssembly(wasmBinaryFile, importObject);

    const asm = instance.exports as TAsm;
    const wasmMemory = asm.c;

    this.updateGlobalBufferAndViews(wasmMemory.buffer);

    const wasmCallCtors = asm.d;

    this.addOnInit(wasmCallCtors);

    return asm;
  }

  private readonly emscriptenMemcpyBig = (destination: number, source: number, number_: number) => {
    this.HEAPU8?.copyWithin(destination, source, source + number_);
  };

  private readonly emscriptenResizeHeap = (requestedSizeOriginal: number) => {
    const oldSize = this.HEAPU8?.length ?? 0;

    const requestedSize = requestedSizeOriginal >>> 0;

    const maxHeapSize = getHeapMax();

    if (requestedSize > maxHeapSize) {
      return false;
    }

    for (let cutDown = 1; cutDown <= 4; cutDown *= 2) {
      let overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);

      overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100_663_296);

      const newSize = Math.min(
        maxHeapSize,
        alignUp(Math.max(requestedSize, overGrownHeapSize), 65_536),
      );
      const replacement = this.emscriptenReallocBuffer(newSize);

      if (replacement) {
        return true;
      }
    }

    return false;
  };

  private readonly emscriptenReallocBuffer = (size: number) => {
    try {
      this.wasmMemory.grow((size - (this.buffer?.byteLength ?? 0) + 65_535) >>> 16);
      this.updateGlobalBufferAndViews(this.wasmMemoryBuffer);

      return 1;
    } catch (error) {
      logger(error);

      return 0;
    }
  };

  private updateGlobalBufferAndViews(buffer: ArrayBuffer) {
    this.buffer = buffer;

    this.HEAPU8 = new Uint8Array(buffer);
    this.HEAPF32 = new Float32Array(buffer);
  }

  private addOnInit(callback: WebAssembly.ExportValue) {
    this.atInit.unshift(callback);
  }

  private initRuntime() {
    this.callRuntimeCallbacks(this.atInit);
  }

  private readonly callRuntimeCallbacks = (callbacks: WebAssembly.ExportValue[]) => {
    while (callbacks.length > 0) {
      const callback = callbacks.shift();

      if (typeof callback === 'function') {
        callback(this);
      }
    }
  };
}

export default Rnnoise;
