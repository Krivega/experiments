import { flushPromises } from '@experiments/test-utils';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import SetName from '../SetName';

import type { TInstance } from '../../@Model';

describe('SetName', () => {
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;

  let instance: TInstance;
  let action: SetName;

  beforeEach(() => {
    instance = Model.create({ isModerator: false });

    // Не оборачиваем CoreApi в wrapMethodsWithJestFunction, так как он использует MobX action методы
    mockCoreApi = new CoreApi();
    // Оборачиваем только методы, которые проверяются в тестах
    jest.spyOn(mockCoreApi, 'getName');
    mockServerApi = wrapMethodsWithJestFunction(new ServerApi());

    action = new SetName({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
    });

    instance.setSyncInProgress();
    instance.setAvailable();
  });

  describe('успешное выполнение', () => {
    it('должен установить статус ACTIVE при успешном запросе', async () => {
      action.execute(undefined);

      await flushPromises();

      expect(instance.isActive).toBe(true);
    });

    it('должен вызвать requestSetName с именем из coreApi', async () => {
      const mockName = 'Test User';

      jest.mocked(mockCoreApi.getName).mockReturnValue(mockName);

      action.execute(undefined);

      await flushPromises();

      expect(mockCoreApi.getName).toHaveBeenCalledTimes(1);
      expect(mockServerApi.requestSetName).toHaveBeenCalledWith(mockName);
    });

    it('должен использовать пустую строку если имя не задано', async () => {
      jest.mocked(mockCoreApi.getName).mockReturnValue(undefined);

      action.execute(undefined);

      await flushPromises();

      expect(mockCoreApi.getName).toHaveBeenCalledTimes(1);
      expect(mockServerApi.requestSetName).toHaveBeenCalledWith('');
    });

    it('должен обрезать имя до 120 символов', async () => {
      const longName = 'a'.repeat(150);

      jest.mocked(mockCoreApi.getName).mockReturnValue(longName);

      action.execute(undefined);

      await flushPromises();

      expect(mockServerApi.requestSetName).toHaveBeenCalledWith('a'.repeat(120));
    });
  });

  describe('обработка ошибок', () => {
    it('должен установить статус NOT_AVAILABLE при не-aborted ошибке', async () => {
      mockServerApi.setFailAllRequests();
      jest.mocked(mockServerApi.hasAbortedError).mockReturnValue(false);

      action.execute(undefined);

      await flushPromises();

      expect(mockServerApi.hasAbortedError).toHaveBeenCalledTimes(1);
      expect(instance.isNotAvailable).toBe(true);
    });

    it('не должен изменять статус при aborted ошибке', async () => {
      mockServerApi.setFailAllRequests();
      jest.mocked(mockServerApi.hasAbortedError).mockReturnValue(true);

      action.execute(undefined);

      await flushPromises();

      expect(mockServerApi.hasAbortedError).toHaveBeenCalledTimes(1);
      expect(instance.isAvailable).toBe(true);
    });
  });
});
