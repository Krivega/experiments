/// <reference types="jest" />
/* eslint-disable max-classes-per-file */

import { flushPromises } from '@experiments/test-utils';

import Model from '../../AbstractValidatorAction/__fixtures__/MockModel';
import AbstractExecutableAction from '../AbstractExecutableAction';

import type { TInstance } from '../../AbstractValidatorAction/__fixtures__/MockModel';
import type { TBaseDependencies } from '../types';

const storeDependencies = {
  serverApi: {
    getData: async (_data: { id: string; name: string }) => {
      return { id: '1', name: 'John Doe' };
    },

    patchData: async (_data: { uid: string; description: string }) => {
      return { uid: '1', description: 'John Doe' };
    },
  },
  coreApi: {
    onSubscribe: (callback: (id: string) => void) => {
      return (id: string) => {
        callback(id);
      };
    },
    hideAllNotifications: () => {},
  },
};

class ParametersAction extends AbstractExecutableAction<
  TInstance,
  typeof storeDependencies,
  { id: string }
> {
  public handleErrorAction = jest.fn();

  public handleErrorValidation = jest.fn();

  public handleSuccessAction = jest.fn((_response: { id: string }) => {});

  public handleFinallyAction = jest.fn();

  public beforeRun = jest.fn();

  public run = jest.fn((params: { id: string }) => {
    return {
      promise: Promise.resolve(params),
      abort: jest.fn(),
    };
  });
}

class StringParametersAction extends AbstractExecutableAction<
  TInstance,
  typeof storeDependencies,
  string
> {
  public handleErrorAction = jest.fn();

  public handleErrorValidation = jest.fn();

  public handleSuccessAction = jest.fn((_response: string) => {});

  public handleFinallyAction = jest.fn();

  public beforeRun = jest.fn();

  public run = jest.fn((params: string) => {
    return {
      promise: Promise.resolve(params),
      abort: jest.fn(),
    };
  });
}

describe('AbstractExecutableAction: параметры', () => {
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create({ isValid: true });
  });

  it('должен вызывать метод run с неверными типами execute', async () => {
    const action = new StringParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    action.execute('string');

    await flushPromises();

    expect(action.run).toHaveBeenCalledTimes(1);
    expect(action.run).toHaveBeenCalledWith('string');
  });

  it('должен вызывать метод run с неверными типами onSuccess', async () => {
    const action = new ParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    const onSuccessMocked = jest.fn((_params: { id: number }) => {});

    // @ts-expect-error
    action.execute({ id: '1' }, { onSuccess: onSuccessMocked });

    await flushPromises();

    expect(action.run).toHaveBeenCalledTimes(1);
    expect(onSuccessMocked).toHaveBeenCalledTimes(1);
    expect(onSuccessMocked).toHaveBeenCalledWith({ id: '1' });
  });

  it('должен вызывать метод beforeRun с неверными типами execute', async () => {
    const action = new StringParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    const beforeRunMocked = jest.spyOn(action, 'beforeRun');

    action.execute('string');

    await flushPromises();

    expect(beforeRunMocked).toHaveBeenCalledTimes(1);
    expect(beforeRunMocked).toHaveBeenCalledWith('string');
  });

  it('должен вызывать метод handleSuccessAction с неверным типом response', async () => {
    const action = new StringParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    const handleSuccessActionMocked = jest.spyOn(action, 'handleSuccessAction');

    action.execute('string');

    await flushPromises();

    expect(handleSuccessActionMocked).toHaveBeenCalledTimes(1);
    expect(handleSuccessActionMocked).toHaveBeenCalledWith('string');
  });

  it('поддерживает Partial dependencies по типам', async () => {
    class NoopAction extends AbstractExecutableAction<
      TInstance,
      TBaseDependencies,
      { id: string }
    > {
      public run = jest.fn((_params: { id: string }) => {
        return { promise: Promise.resolve({ id: '1' }), abort: jest.fn() };
      });
    }

    const emptyDepsAction = new NoopAction({
      instance,
      dependencies: {},
    });

    emptyDepsAction.execute({ id: '1' });

    await flushPromises();

    const coreApiOnlyAction = new NoopAction({
      instance,
      dependencies: { coreApi: {} },
    });

    coreApiOnlyAction.execute({ id: '1' });

    await flushPromises();

    const serverApiOnlyAction = new NoopAction({
      instance,
      dependencies: { serverApi: storeDependencies.serverApi },
    });

    serverApiOnlyAction.execute({ id: '1' });

    await flushPromises();

    expect(emptyDepsAction.run).toHaveBeenCalledTimes(1);
    expect(coreApiOnlyAction.run).toHaveBeenCalledTimes(1);
    expect(serverApiOnlyAction.run).toHaveBeenCalledTimes(1);
  });
});
