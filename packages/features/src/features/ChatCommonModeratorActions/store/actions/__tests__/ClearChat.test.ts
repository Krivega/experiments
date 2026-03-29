import delayPromise from 'promise-delay';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import ClearChat from '../ClearChat';

import type { TInstance } from '../../@Model';

describe('ClearChat', () => {
  const mockServerApi = wrapMethodsWithJestFunction(new ServerApi());
  const mockCoreApi = wrapMethodsWithJestFunction(new CoreApi());

  let action: ClearChat;
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();

    action = new ClearChat({
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
    it('должен скрывать уведомления, вызывать serverApi.clearChat при успехе', async () => {
      action.execute(undefined);

      await delayPromise(0);

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockServerApi.clearChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.showErrorFailedToClearChat).not.toHaveBeenCalled();
    });

    it('должен устанавливать isClearChatInProgress в true в начале выполнения', async () => {
      const spyStartAction = jest.spyOn(instance, 'startClearChatAction');

      action.execute(undefined);

      await delayPromise(0);

      expect(spyStartAction).toHaveBeenCalledTimes(1);
    });

    it('должен устанавливать isClearChatInProgress в false после завершения', async () => {
      action.execute(undefined);

      await delayPromise(0);

      expect(instance.isClearChatInProgress).toBe(false);
    });
  });

  describe('обработка ошибок', () => {
    it('должен вызывать coreApi.showErrorFailedToClearChat при ошибке сервера', async () => {
      mockServerApi.setFailAllRequests();

      action.execute(undefined);

      await delayPromise(0);

      expect(mockCoreApi.hideAllNotifications).toHaveBeenCalledTimes(1);
      expect(mockServerApi.clearChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.showErrorFailedToClearChat).toHaveBeenCalledTimes(1);
    });

    it('должен устанавливать isClearChatInProgress в false при ошибке', async () => {
      mockServerApi.setFailAllRequests();

      action.execute(undefined);

      await delayPromise(0);

      expect(instance.isClearChatInProgress).toBe(false);
    });
  });
});
