/// <reference types="jest" />
import { resolveMockPromise } from '..';

describe('resolveMockPromise', () => {
  it('should resolve the promise', async () => {
    const [promise, resolvePromise] = resolveMockPromise<string>();
    const mockValue = 'resolved';

    setTimeout(() => {
      resolvePromise(mockValue);
    }, 1000);

    let resolvedValue = 'resolvedValue';

    await promise.then((value: string) => {
      resolvedValue = value;
    });

    expect(resolvedValue).toBe(mockValue);
  });
});
