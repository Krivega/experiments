import delayPromise from 'promise-delay';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import DisableChat from '../DisableChat';

import type { TInstance } from '../../@Model';

describe('DisableChat', () => {
  const mockServerApi = wrapMethodsWithJestFunction(new ServerApi());
  const mockCoreApi = wrapMethodsWithJestFunction(new CoreApi());

  let action: DisableChat;
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();

    action = new DisableChat({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockServerApi.reset();
  });

  describe('успешное выполнение', () => {
    it('должен скрывать уведомления, вызывать serverApi.disableChat и coreApi.chatDisabled при успехе', async () => {
      action.execute(undefined);

      await delayPromise(0);

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockServerApi.disableChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.chatDisabled).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.showErrorFailedToDisableChat).not.toHaveBeenCalled();
    });

    it('должен устанавливать isDisableChatInProgress в true в начале выполнения', async () => {
      const spyStartAction = jest.spyOn(instance, 'startDisableChatAction');

      action.execute(undefined);

      await delayPromise(0);

      expect(spyStartAction).toHaveBeenCalledTimes(1);
    });

    it('должен устанавливать isDisableChatInProgress в false после завершения', async () => {
      action.execute(undefined);

      await delayPromise(0);

      expect(instance.isDisableChatInProgress).toBe(false);
    });
  });

  describe('обработка ошибок', () => {
    it('должен вызывать coreApi.showErrorFailedToDisableChat при ошибке сервера', async () => {
      mockServerApi.setFailAllRequests();

      action.execute(undefined);

      await delayPromise(0);

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockServerApi.disableChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.showErrorFailedToDisableChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.chatDisabled).not.toHaveBeenCalled();
    });

    it('должен устанавливать isDisableChatInProgress в false даже при ошибке', async () => {
      mockServerApi.setFailAllRequests();

      action.execute(undefined);

      await delayPromise(0);

      expect(instance.isDisableChatInProgress).toBe(false);
    });
  });
});
