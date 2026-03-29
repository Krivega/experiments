/* eslint-disable max-classes-per-file */

/// <reference types="jest" />

import { flushPromises } from '@experiments/test-utils';

import Model from '../../AbstractValidatorAction/__fixtures__/MockModel';
import AbstractExecutableAction from '../AbstractExecutableAction';

import type { TInstance } from '../../AbstractValidatorAction/__fixtures__/MockModel';

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

class NoParametersAction extends AbstractExecutableAction<TInstance, typeof storeDependencies> {
  public handleErrorAction = jest.fn();

  public handleErrorValidation = jest.fn();

  public handleSuccessAction = jest.fn();

  public handleFinallyAction = jest.fn();

  public beforeRun = jest.fn();

  public runMock = jest.fn();

  public run() {
    return AbstractExecutableAction.resolveAsyncActionNoParams(this.runMock)();
  }
}

class ParametersAction extends AbstractExecutableAction<
  TInstance,
  typeof storeDependencies,
  { id: string }
> {
  public handleErrorAction = jest.fn();

  public handleErrorValidation = jest.fn();

  public handleSuccessAction = jest.fn();

  public handleFinallyAction = jest.fn();

  public beforeRun = jest.fn();

  public runMock = jest.fn((params: { id: string }) => {
    return params;
  });

  public run(params: { id: string }) {
    return AbstractExecutableAction.resolveAsyncAction(this.runMock)(params);
  }
}

describe('AbstractExecutableAction: параметры', () => {
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create({ isValid: true });
  });

  it('должен вызывать метод run без параметров', async () => {
    const action = new NoParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    action.execute(undefined);

    await flushPromises();

    expect(action.runMock).toHaveBeenCalledTimes(1);
  });

  it('должен вызывать метод run с опциями', async () => {
    const action = new NoParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    const onSuccessMocked = jest.fn();

    action.execute(undefined, { onSuccess: onSuccessMocked });

    await flushPromises();

    expect(action.runMock).toHaveBeenCalledTimes(1);
    expect(onSuccessMocked).toHaveBeenCalledTimes(1);
    expect(onSuccessMocked).toHaveBeenCalledWith(undefined);
  });

  it('должен вызывать метод run с параметрами', async () => {
    const action = new ParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    action.execute({ id: '1' });

    await flushPromises();

    expect(action.runMock).toHaveBeenCalledTimes(1);
  });

  it('должен вызывать метод run с параметрами и опциями', async () => {
    const action = new ParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    const onSuccessMocked = jest.fn((_params: { id: string }) => {});

    action.execute({ id: '1' }, { onSuccess: onSuccessMocked });

    await flushPromises();

    expect(action.runMock).toHaveBeenCalledTimes(1);
    expect(onSuccessMocked).toHaveBeenCalledTimes(1);
    expect(onSuccessMocked).toHaveBeenCalledWith({ id: '1' });
  });

  it('должен вызывать метод beforeRun', async () => {
    const action = new ParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    const beforeRunMocked = jest.spyOn(action, 'beforeRun');

    action.execute({ id: '1' });

    await flushPromises();

    expect(beforeRunMocked).toHaveBeenCalledTimes(1);
    expect(beforeRunMocked).toHaveBeenCalledWith({ id: '1' });
  });

  it('должен вызывать метод handleSuccessAction', async () => {
    const action = new ParametersAction({
      instance,
      dependencies: storeDependencies,
    });

    const handleSuccessActionMocked = jest.spyOn(action, 'handleSuccessAction');

    action.execute({ id: '1' });

    await flushPromises();

    expect(handleSuccessActionMocked).toHaveBeenCalledTimes(1);
    expect(handleSuccessActionMocked).toHaveBeenCalledWith({ id: '1' });
  });
});
