import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import SyncMessages from '../SyncMessages';

import type { TInitialStateMessage, TInstance } from '../../@Model';

const mockMessages: TInitialStateMessage[] = [
  {
    id: '1',
    text: 'Message 1',
    my: false,
    timestamp: 1_760_611_617_120,
    title: 'User 1',
    isRead: false,
  },
  {
    id: '2',
    text: 'Message 2',
    my: true,
    timestamp: 1_760_611_617_121,
    title: 'User 2',
    isRead: true,
  },
];

describe('SyncMessages', () => {
  let instance: TInstance;
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;
  let reaction: SyncMessages;

  beforeEach(() => {
    instance = Model.create();

    // Не оборачиваем CoreApi в wrapMethodsWithJestFunction, так как он использует MobX action методы
    // которые становятся read-only после makeObservable
    mockCoreApi = new CoreApi();
    mockServerApi = wrapMethodsWithJestFunction(new ServerApi());

    reaction = new SyncMessages({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
      executableActions: {},
    });

    reaction.start();
  });

  describe('инициализация', () => {
    it('должен подписаться на onReceiveMessages только когда hasAvailable => true', () => {
      expect(mockServerApi.onReceiveMessages).toHaveBeenCalledTimes(0);

      mockCoreApi.setIsAvailable(true);

      expect(mockServerApi.onReceiveMessages).toHaveBeenCalledTimes(1);
    });
  });

  describe('очистка сообщений', () => {
    it('должен очищать сообщения когда hasAvailable => false', () => {
      instance.setMessages(mockMessages);

      expect(instance.messages.length).toBe(2);

      mockCoreApi.setIsAvailable(true);
      mockCoreApi.setIsAvailable(false);

      expect(instance.messages.length).toBe(0);
    });

    it('должен отписываться от получения сообщений когда hasAvailable => false', () => {
      mockCoreApi.setIsAvailable(true);

      expect(mockServerApi.onReceiveMessages).toHaveBeenCalledTimes(1);

      mockCoreApi.setIsAvailable(false);
      mockServerApi.emitReceiveMessages(mockMessages);

      expect(instance.messages.length).toBe(0);
    });
  });

  describe('синхронизация сообщений', () => {
    it('должен обновлять сообщения при получении новых когда hasAvailable => true', () => {
      expect(instance.messages.length).toBe(0);

      mockCoreApi.setIsAvailable(true);
      mockServerApi.emitReceiveMessages(mockMessages);

      expect(instance.messages.length).toBe(2);
      expect(instance.messages[0].text).toBe('Message 1');
      expect(instance.messages[1].text).toBe('Message 2');
    });

    it('должен корректно обрабатывать пустой массив сообщений', () => {
      instance.setMessages(mockMessages);

      expect(instance.messages.length).toBe(2);

      mockCoreApi.setIsAvailable(true);
      mockServerApi.emitReceiveMessages([]);

      expect(instance.messages.length).toBe(0);
    });
  });

  describe('остановка реакции', () => {
    it('должен отписаться от onReceiveMessages при остановке', () => {
      const mockOnReceiveMessagesDisposer = jest.fn();

      jest.mocked(mockServerApi.onReceiveMessages).mockReturnValue(mockOnReceiveMessagesDisposer);

      mockCoreApi.setIsAvailable(true);

      reaction.stop();

      expect(mockOnReceiveMessagesDisposer).toHaveBeenCalledTimes(1);
    });

    it('должен отписаться от hasAvailable реакции при остановке', () => {
      reaction.stop();

      mockCoreApi.setIsAvailable(true);

      expect(mockServerApi.onReceiveMessages).toHaveBeenCalledTimes(0);
    });
  });

  describe('переключение состояний', () => {
    it('должен корректно обрабатывать переключение hasAvailable', () => {
      mockCoreApi.setIsAvailable(true);

      expect(mockServerApi.onReceiveMessages).toHaveBeenCalledTimes(1);

      mockCoreApi.setIsAvailable(false);
      mockCoreApi.setIsAvailable(true);

      expect(mockServerApi.onReceiveMessages).toHaveBeenCalledTimes(2);
    });

    it('должен отписываться от предыдущей подписки при новом hasAvailable => true', () => {
      const mockOnReceiveMessagesDisposer = jest.fn();

      jest.mocked(mockServerApi.onReceiveMessages).mockReturnValue(mockOnReceiveMessagesDisposer);

      mockCoreApi.setIsAvailable(true);
      instance.setMessages(mockMessages);

      expect(instance.messages.length).toBe(2);
      expect(mockOnReceiveMessagesDisposer).toHaveBeenCalledTimes(0);

      mockCoreApi.setIsAvailable(false);

      expect(mockOnReceiveMessagesDisposer).toHaveBeenCalledTimes(1);

      mockCoreApi.setIsAvailable(true);

      expect(mockOnReceiveMessagesDisposer).toHaveBeenCalledTimes(2);
    });
  });
});
