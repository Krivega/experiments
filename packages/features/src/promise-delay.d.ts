/* eslint-disable unicorn/filename-case */
declare module 'promise-delay' {
  function promiseDelay<T>(delay: number, value?: T): Promise<T>;
  function delayedReject<T>(delay: number, value?: T): Promise<T>;

  export = promiseDelay;
  export { delayedReject };
}
