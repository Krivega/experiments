/// <reference types="jest" />
/// <reference types="jest-extended" />
import { observable } from 'mobx';

import resolveWhenThereIsTime from '../index';

describe('resolveWhenThereIsTime', () => {
  const timeout = 1000;

  let predicate: () => boolean;
  let observableObject: {
    value: boolean;
  };
  let whenThereIsTime: {
    dispose: () => void;
    when: () => Promise<void>;
  };
  let testedFunction: jest.Mock;

  beforeEach(() => {
    observableObject = observable({ value: false });
    testedFunction = jest.fn();
    predicate = () => {
      return observableObject.value;
    };

    whenThereIsTime = resolveWhenThereIsTime(predicate, timeout);
  });

  it('should be resolved whenThereIsTime when predicate returns true', async () => {
    expect.assertions(1);

    observableObject.value = true;

    return whenThereIsTime.when().then((response) => {
      expect(response).toBe(undefined);
    });
  });

  it('should be failed whenThereIsTime when predicate returns false', async () => {
    expect.assertions(1);

    observableObject.value = false;

    const promise = whenThereIsTime.when();

    await expect(promise).rejects.toThrowWithMessage(Error, 'Time is ended');
  });

  it('should be disposed subscribe on reaction', async () => {
    expect.assertions(1);

    observableObject.value = false;

    whenThereIsTime.when().catch(() => {
      observableObject.value = true;

      testedFunction();
    });

    return new Promise<void>((resolve) => {
      setTimeout(resolve, timeout * 2);
    }).then(() => {
      expect(testedFunction.mock.calls.length).toBe(1);
    });
  });

  it('should be cleared timeout of promise rejection', async () => {
    expect.assertions(1);

    observableObject.value = false;

    whenThereIsTime.when().catch(() => {
      observableObject.value = false;

      testedFunction();
    });

    return new Promise<void>((resolve) => {
      setTimeout(resolve, timeout * 2);
    }).then(() => {
      expect(testedFunction.mock.calls.length).toBe(1);
    });
  });

  it('should dispose and fall by timeout on dispose', async () => {
    expect.assertions(1);

    observableObject.value = false;

    const promise = whenThereIsTime.when();

    whenThereIsTime.dispose();

    observableObject.value = true;

    await expect(promise).rejects.toMatchObject({
      id: 'ERROR_CANCELED',
      message: 'Promise is canceled',
      moduleName: 'm',
      name: 'Canceled',
    });
  });
});
