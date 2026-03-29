import { flushPromises } from '@experiments/test-utils';

import CoreApi from '../__fixtures__/coreApi';
import instance from '../__fixtures__/instance';
import { ServerApi } from '../__fixtures__/serverApi';
import AbstractActionWithAuthError from '../AbstractActionWithAuthError';

import type { TInstance } from '../__fixtures__/instance';

class TestActionWithAuthError extends AbstractActionWithAuthError<void, TInstance> {}

describe('AbstractActionWithAuthError action', () => {
  let action: TestActionWithAuthError;
  let serverApi: ServerApi;
  let coreApi: CoreApi;

  beforeEach(() => {
    serverApi = new ServerApi();
    coreApi = new CoreApi();
    action = new TestActionWithAuthError({ instance, dependencies: { coreApi, serverApi } });
  });

  it('не должен показывать ошибки при отмене запроса', async () => {
    serverApi.doAbortRequests();

    action.execute(undefined);

    await flushPromises();

    expect(coreApi.showErrorAction).not.toHaveBeenCalled();
    expect(coreApi.showErrorActionUnauthorized).not.toHaveBeenCalled();
  });

  it('должен показывать общую ошибку при ошибке запроса', async () => {
    serverApi.doFailRequests();

    action.execute(undefined);

    await flushPromises();

    expect(coreApi.showErrorAction).toHaveBeenCalledTimes(1);
    expect(coreApi.showErrorActionUnauthorized).not.toHaveBeenCalled();
  });

  describe('обработка ошибок неавторизованных запросов', () => {
    it('должен показывать ошибку при неавторизованном запросе', async () => {
      serverApi.doUnauthorizedRequests();

      action.execute(undefined);

      await flushPromises();

      expect(coreApi.showErrorActionUnauthorized).toHaveBeenCalledTimes(1);
      expect(coreApi.showErrorAction).not.toHaveBeenCalled();
    });

    it('должен показывать общую ошибку при неавторизованном запросе, если hasUnauthorizedError не передан', async () => {
      serverApi.doUnauthorizedRequests();
      serverApi.hasUnauthorizedError = undefined as unknown as jest.Mock;

      action.execute(undefined);

      await flushPromises();

      expect(coreApi.showErrorAction).toHaveBeenCalledTimes(1);
      expect(coreApi.showErrorActionUnauthorized).not.toHaveBeenCalled();
    });

    it('не должен показывать общую ошибку при неавторизованном запросе, если showErrorActionUnauthorized не передан', async () => {
      serverApi.doUnauthorizedRequests();
      coreApi.showErrorActionUnauthorized = undefined as unknown as jest.Mock;

      action.execute(undefined);

      await flushPromises();

      expect(coreApi.showErrorAction).not.toHaveBeenCalled();
      expect(coreApi.showErrorActionUnauthorized).toBeUndefined();
    });
  });
});
