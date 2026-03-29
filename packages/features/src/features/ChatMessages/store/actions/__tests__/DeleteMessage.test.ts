import { flushPromises } from '@experiments/test-utils';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import DeleteMessage from '../DeleteMessage';

import type { TInstance } from '../../@Model';

describe('DeleteMessage', () => {
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;

  let action: DeleteMessage;
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();

    // Не оборачиваем CoreApi в wrapMethodsWithJestFunction, так как он использует MobX action методы
    mockCoreApi = new CoreApi();
    mockServerApi = wrapMethodsWithJestFunction(new ServerApi());

    action = new DeleteMessage({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
    });
  });

  describe('успешное выполнение', () => {
    it('должен вызывать serverApi.deleteMessage с переданным messageId', async () => {
      const messageId = 'test-message-id';

      action.execute(messageId);

      await flushPromises();

      expect(mockServerApi.deleteMessage).toHaveBeenCalledTimes(1);
      expect(mockServerApi.deleteMessage).toHaveBeenCalledWith(messageId);
    });
  });

  describe('разные messageId', () => {
    it('должен корректно обрабатывать различные ID сообщений', async () => {
      const messageIds = ['msg-1', 'msg-2', 'msg-3'] as const;

      for (const messageId of messageIds) {
        action.execute(messageId);
      }

      await flushPromises();

      expect(mockServerApi.deleteMessage).toHaveBeenCalledTimes(messageIds.length);

      for (const id of messageIds) {
        expect(mockServerApi.deleteMessage).toHaveBeenCalledWith(id);
      }
    });
  });
});
