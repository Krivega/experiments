/// <reference types="vite/client" />
/// <reference types="jest" />

declare module 'promise-delay' {
  const content: <T>(delay: number, value?: T) => Promise<T>;
  export default content;
}

declare module 'ms-to-hms' {
  export default function msToHms(ms: number): string;
}
