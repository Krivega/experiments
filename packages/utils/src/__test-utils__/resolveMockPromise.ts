const resolveMockPromise = <T>(): [promise: Promise<T>, resolvePromise: jest.Mock] => {
  let resolvePromise: jest.Mock = jest.fn();

  const promise = new Promise<T>((resolve) => {
    resolvePromise = jest.fn(resolve);
  });

  return [promise, resolvePromise];
};

export default resolveMockPromise;
