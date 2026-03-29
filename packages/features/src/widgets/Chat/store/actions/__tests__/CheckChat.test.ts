import { flushPromises } from '@experiments/test-utils';

import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import CheckChat from '../CheckChat';

import type { TInstance } from '../../@Model';

describe('CheckChat', () => {
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;

  let instance: TInstance;
  let action: CheckChat;

  beforeEach(() => {
    instance = Model.create({ isModerator: false });

    mockCoreApi = new CoreApi();
    mockServerApi = new ServerApi();

    action = new CheckChat({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
    });
  });

  it('должен установить статус SYNC_IN_PROGRESS в начале запроса', () => {
    action.execute(undefined);

    expect(instance.isSyncInProgress).toBe(true);
  });

  describe('успешное выполнение', () => {
    it('должен установить статус AVAILABLE при isEnabled = true', async () => {
      action.execute(undefined);

      await flushPromises();

      expect(instance.isAvailable).toBe(true);
      expect(instance.isNotAvailable).toBe(false);
    });

    it('должен установить статус NOT_AVAILABLE при isEnabled = false', async () => {
      mockServerApi.setData({ isEnabled: false });

      action.execute(undefined);

      await flushPromises();

      expect(instance.isAvailable).toBe(false);
      expect(instance.isNotAvailable).toBe(true);
    });
  });

  describe('обработка ошибок', () => {
    it('не должен сбрасывать статус при ошибке сервера', async () => {
      mockServerApi.setFailAllRequests();

      action.execute(undefined);

      await flushPromises();

      expect(instance.isAvailable).toBe(false);
      expect(instance.isNotAvailable).toBe(false);
      expect(instance.isSyncInProgress).toBe(true);
    });
  });
});
