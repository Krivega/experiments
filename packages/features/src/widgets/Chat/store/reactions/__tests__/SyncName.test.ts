import { flushPromises } from '@experiments/test-utils';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import { SetName } from '../../actions';
import SyncName from '../SyncName';

import type { TInstance } from '../../@Model';

describe('SyncName', () => {
  let instance: TInstance;
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;
  let reaction: SyncName;
  let setName: SetName;

  beforeEach(() => {
    instance = Model.create({ isModerator: false });

    // Не оборачиваем CoreApi в wrapMethodsWithJestFunction, так как он использует MobX action методы
    mockCoreApi = new CoreApi();
    mockServerApi = wrapMethodsWithJestFunction(new ServerApi());

    setName = new SetName({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
    });

    reaction = new SyncName({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
      executableActions: {
        setName,
      },
    });

    reaction.start();

    instance.setSyncInProgress();
  });

  describe('инициализация', () => {
    it('должен запустить setName при isAvailable = true', async () => {
      instance.setAvailable();

      await flushPromises();

      expect(mockServerApi.requestSetName).toHaveBeenCalledTimes(1);
    });

    it('не должен запускать setName при isAvailable = false', async () => {
      instance.setAvailable();

      jest.clearAllMocks();

      instance.setNotAvailable();

      await flushPromises();

      expect(mockServerApi.requestSetName).not.toHaveBeenCalled();
    });
  });

  describe('изменение состояния', () => {
    it('должен запустить setName при переходе isAvailable: false -> true', async () => {
      instance.setNotAvailable();

      await flushPromises();

      expect(mockServerApi.requestSetName).not.toHaveBeenCalled();

      instance.setAvailable();

      await flushPromises();

      expect(mockServerApi.requestSetName).toHaveBeenCalledTimes(1);
      expect(instance.isActive).toBe(true);
    });

    it('должен отменить setName при переходе isAvailable: true -> false', async () => {
      const cancelSpy = jest.spyOn(setName, 'cancel');

      instance.setAvailable();

      await flushPromises();

      instance.setNotAvailable();

      await flushPromises();

      expect(cancelSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('остановка реакции', () => {
    it('должен отменить setName при остановке', async () => {
      const cancelSpy = jest.spyOn(setName, 'cancel');

      reaction.stop();

      expect(cancelSpy).toHaveBeenCalledTimes(1);
    });
  });
});
