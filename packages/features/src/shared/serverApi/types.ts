export type TApiMethod<T = void> = {
  promise: Promise<T>;
  abort: () => void;
};
