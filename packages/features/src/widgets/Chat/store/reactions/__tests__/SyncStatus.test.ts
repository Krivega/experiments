import { flushPromises } from '@experiments/test-utils';
import delayPromise from 'promise-delay';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import { CheckChat } from '../../actions';
import SyncStatus from '../SyncStatus';

import type { TInstance } from '../../@Model';

const REQUEST_INTERVAL = 100;

describe('SyncStatus', () => {
  let instance: TInstance;
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;
  let reaction: SyncStatus;
  let checkChat: CheckChat;

  beforeEach(() => {
    instance = Model.create({ isModerator: false });

    // Не оборачиваем CoreApi в wrapMethodsWithJestFunction, так как он использует MobX action методы
    mockCoreApi = new CoreApi();
    // Оборачиваем только методы, которые проверяются в тестах
    jest.spyOn(mockCoreApi, 'onAvailableToStartChat');
    jest.spyOn(mockCoreApi, 'getRequestInterval');
    mockServerApi = wrapMethodsWithJestFunction(new ServerApi());

    checkChat = new CheckChat({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
    });

    reaction = new SyncStatus({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
      executableActions: {
        checkChat,
      },
    });

    jest.mocked(mockCoreApi.getRequestInterval).mockReturnValue(REQUEST_INTERVAL);

    reaction.start();
  });

  describe('инициализация', () => {
    it('должен подписаться на onAvailableToStartChat при старте', () => {
      expect(mockCoreApi.onAvailableToStartChat).toHaveBeenCalledTimes(1);
    });
  });

  describe('успешные сценарии', () => {
    it('должен запустить синхронизацию при вызове onAvailable', async () => {
      mockCoreApi.emitAvailable();

      await flushPromises();

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(1);
      expect(mockServerApi.onError).toHaveBeenCalledTimes(1);
    });

    it('должен дождаться завершения запроса перед следующим запросом', async () => {
      let resolveFirstRequest: ((value: boolean) => void) | undefined;

      const firstRequestPromise = new Promise<boolean>((resolve) => {
        resolveFirstRequest = resolve;
      });

      jest.mocked(mockServerApi.requestCheckChat).mockImplementationOnce(() => {
        return {
          promise: firstRequestPromise,
          abort: jest.fn(),
        };
      });

      mockCoreApi.emitAvailable();

      await flushPromises();

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(1);

      await delayPromise(REQUEST_INTERVAL);

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(1);

      resolveFirstRequest?.(true);

      await flushPromises();
      await delayPromise(REQUEST_INTERVAL);

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(2);
    });

    it('должен остановить синхронизацию при вызове onNotAvailable', async () => {
      const checkChatCancelSpy = jest.spyOn(checkChat, 'cancel');
      const disposeErrorSpy = jest.fn();

      jest.mocked(mockServerApi.onError).mockReturnValue(disposeErrorSpy);

      reaction.start();

      mockCoreApi.emitAvailable();

      jest.clearAllMocks();

      mockCoreApi.emitNotAvailable();

      expect(checkChatCancelSpy).toHaveBeenCalledTimes(1);
      expect(disposeErrorSpy).toHaveBeenCalledTimes(1);
      expect(instance.isNotSynced).toBe(true);
    });

    it('должен повторить запрос при isEnabled = false', async () => {
      mockServerApi.setData({ isEnabled: false });

      mockCoreApi.emitAvailable();

      await flushPromises();

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.getRequestInterval).toHaveBeenCalled();

      await delayPromise(REQUEST_INTERVAL);

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(2);
    });

    it('должен повторить запрос при isEnabled = true', async () => {
      mockServerApi.setData({ isEnabled: true });

      mockCoreApi.emitAvailable();

      await flushPromises();

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(1);
      expect(mockCoreApi.getRequestInterval).toHaveBeenCalled();

      await delayPromise(REQUEST_INTERVAL);

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(2);
    });
  });

  describe('обработка ошибок', () => {
    it('должен дождаться и повторить запрос при ошибке CheckChat', async () => {
      let rejectFirstRequest: ((error: Error) => void) | undefined;

      const firstRequestPromise = new Promise<boolean>((_resolve, reject) => {
        rejectFirstRequest = reject;
      });

      jest.mocked(mockServerApi.requestCheckChat).mockImplementationOnce(() => {
        return {
          promise: firstRequestPromise,
          abort: jest.fn(),
        };
      });

      mockCoreApi.emitAvailable();

      await flushPromises();

      expect(instance.isSyncInProgress).toBe(true);
      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(1);

      await delayPromise(REQUEST_INTERVAL);

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(1);

      rejectFirstRequest?.(new Error('Failed'));

      await flushPromises();
      await delayPromise(REQUEST_INTERVAL);

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(2);
    });

    it('должен перезапустить синхронизацию при ошибке чата', async () => {
      mockCoreApi.emitAvailable();

      await flushPromises();

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(1);

      mockServerApi.emitError(new Error('Chat error'));

      await flushPromises();

      expect(mockServerApi.requestCheckChat).toHaveBeenCalledTimes(2);
    });
  });

  describe('остановка реакции', () => {
    it('должен отписаться от onAvailableToStartChat при остановке', () => {
      const disposeSpy = jest.fn();

      jest.mocked(mockCoreApi.onAvailableToStartChat).mockReturnValue(disposeSpy);

      reaction.start();
      reaction.stop();

      expect(disposeSpy).toHaveBeenCalledTimes(1);
    });

    it('должен отписаться от onError при остановке', async () => {
      const disposeErrorSpy = jest.fn();

      jest.mocked(mockServerApi.onError).mockReturnValue(disposeErrorSpy);

      reaction.start();

      mockCoreApi.emitAvailable();

      await flushPromises();

      reaction.stop();

      expect(disposeErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
