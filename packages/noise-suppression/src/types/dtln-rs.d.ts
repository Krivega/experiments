/* eslint-disable unicorn/filename-case */
/* eslint-disable @typescript-eslint/method-signature-style */
declare module 'dtln-rs' {
  export interface DtlnModule {
    dtln_create(): Promise<number>;
    dtln_destroy(handle: number): Promise<void>;
    dtln_denoise(handle: number, input: Float32Array, output: Float32Array): Promise<boolean>;
  }

  export const DtlnPlugin: DtlnModule;

  export default function initDTLN(): Promise<DtlnModule>;
}

declare module 'dtln-rs/dtln_rs.wasm?url' {
  const dtlnWasmUrl: string;
  export default dtlnWasmUrl;
}

declare module 'dtln-rs/dtln_rs.wasm' {
  const dtlnWasmUrl: string;
  export default dtlnWasmUrl;
}
