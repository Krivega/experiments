/// <reference types="vite/client" />
/// <reference types="jest" />
/// <reference types="jest-extended" />

declare module 'promise-delay' {
  const content: <T>(timeout: number) => Promise<T>;
  export default content;
}
