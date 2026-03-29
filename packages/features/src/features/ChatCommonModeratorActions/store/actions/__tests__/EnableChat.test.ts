import delayPromise from 'promise-delay';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import EnableChat from '../EnableChat';

import type { TInstance } from '../../@Model';

describe('EnableChat', () => {
  const mockServerApi = wrapMethodsWithJestFunction(new ServerApi());
  const mockCoreApi = wrapMethodsWithJestFunction(new CoreApi());

  let action: EnableChat;
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();

    action = new EnableChat({
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
    it('должен скрывать уведомления, вызывать serverApi.enableChat и coreApi.chatEnabled при успехе', async () => {
      action.execute(undefined);

      await delayPromise(0);

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockServerApi.enableChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.chatEnabled).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.showErrorFailedToEnableChat).not.toHaveBeenCalled();
    });

    it('должен устанавливать isEnableChatInProgress в true в начале выполнения', async () => {
      const spyStartAction = jest.spyOn(instance, 'startEnableChatAction');

      action.execute(undefined);

      await delayPromise(0);

      expect(spyStartAction).toHaveBeenCalledTimes(1);
    });

    it('должен устанавливать isEnableChatInProgress в false после завершения', async () => {
      action.execute(undefined);

      await delayPromise(0);

      expect(instance.isEnableChatInProgress).toBe(false);
    });
  });

  describe('обработка ошибок', () => {
    it('должен вызывать coreApi.showErrorFailedToEnableChat при ошибке сервера', async () => {
      mockServerApi.setFailAllRequests();

      action.execute(undefined);

      await delayPromise(0);

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockServerApi.enableChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.showErrorFailedToEnableChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.chatEnabled).not.toHaveBeenCalled();
    });

    it('должен устанавливать isEnableChatInProgress в false даже при ошибке', async () => {
      mockServerApi.setFailAllRequests();

      action.execute(undefined);

      await delayPromise(0);

      expect(instance.isEnableChatInProgress).toBe(false);
    });
  });
});
