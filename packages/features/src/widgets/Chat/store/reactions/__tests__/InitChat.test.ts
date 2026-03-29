import { flushPromises } from '@experiments/test-utils';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import InitChat from '../InitChat';

import type { TInstance } from '../../@Model';

describe('InitChat', () => {
  let instance: TInstance;
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;
  let reaction: InitChat;

  beforeEach(() => {
    instance = Model.create({ isModerator: false });

    // Не оборачиваем CoreApi в wrapMethodsWithJestFunction, так как он использует MobX action методы
    mockCoreApi = new CoreApi();
    mockServerApi = wrapMethodsWithJestFunction(new ServerApi());

    reaction = new InitChat({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
      executableActions: {},
    });

    reaction.start();

    instance.setSyncInProgress();
  });

  describe('изменение состояния', () => {
    it('должен запустить чат при переходе isActivated: false => true', async () => {
      instance.setNotAvailable();

      await flushPromises();

      expect(mockServerApi.startChat).not.toHaveBeenCalled();

      instance.setAvailable();
      instance.setActive();

      await flushPromises();

      expect(mockServerApi.startChat).toHaveBeenCalledTimes(1);
      expect(mockServerApi.onBan).toHaveBeenCalledTimes(1);
      expect(mockServerApi.onLiftBan).toHaveBeenCalledTimes(1);
    });

    it('должен остановить чат при переходе isActive: true -> false', async () => {
      instance.setAvailable();
      instance.setActive();

      await flushPromises();

      expect(mockServerApi.startChat).toHaveBeenCalledTimes(1);

      instance.setNotAvailable();

      await flushPromises();

      expect(mockServerApi.stopChat).toHaveBeenCalledTimes(1);
    });

    it('должен остановить чат при переходе isBanned: true -> false', async () => {
      instance.setAvailable();
      instance.setActive();
      instance.setBanned();

      await flushPromises();

      expect(mockServerApi.startChat).toHaveBeenCalledTimes(1);

      instance.setNotAvailable();

      await flushPromises();

      expect(mockServerApi.stopChat).toHaveBeenCalledTimes(1);
    });
  });

  describe('подписки на события чата', () => {
    it('должен установить статус banned при бане', async () => {
      instance.setAvailable();
      instance.setActive();

      await flushPromises();

      mockServerApi.emitBan();

      expect(instance.isBanned).toBe(true);
    });

    it('должен установить статус active при снятии бана', async () => {
      instance.setAvailable();
      instance.setActive();

      await flushPromises();

      mockServerApi.emitBan();

      expect(instance.isBanned).toBe(true);

      mockServerApi.emitLiftBan();

      expect(instance.isActive).toBe(true);
    });
  });

  describe('остановка реакции', () => {
    it('должен остановить чат и отписаться от событий при остановке', async () => {
      const disposeBanSpy = jest.fn();
      const disposeLiftBanSpy = jest.fn();

      jest.mocked(mockServerApi.onBan).mockReturnValue(disposeBanSpy);
      jest.mocked(mockServerApi.onLiftBan).mockReturnValue(disposeLiftBanSpy);

      instance.setAvailable();
      instance.setActive();

      await flushPromises();

      reaction.stop();

      expect(mockServerApi.stopChat).toHaveBeenCalledTimes(1);
      expect(disposeBanSpy).toHaveBeenCalledTimes(1);
      expect(disposeLiftBanSpy).toHaveBeenCalledTimes(1);
    });
  });
});
