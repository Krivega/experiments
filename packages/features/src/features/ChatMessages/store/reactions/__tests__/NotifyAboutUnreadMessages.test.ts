import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { encodePoll, encodeVote } from '../../../../../shared/voteEncoding/voteEncoding';
import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import NotifyAboutUnreadMessages from '../NotifyAboutUnreadMessages';

import type { TInitialStateMessage, TInstance } from '../../@Model';

const DEBOUNCE_TIME = 1000;

const oneUnread: TInitialStateMessage[] = [
  {
    id: '1',
    text: 'Message 1',
    my: false,
    timestamp: 1_760_611_617_120,
    title: 'User 1',
    isRead: false,
  },
];

const manyUnread: TInitialStateMessage[] = [
  {
    id: '2',
    text: 'Message 1',
    my: false,
    timestamp: 1_760_611_617_120,
    title: 'User 1',
    isRead: false,
  },
  {
    id: '3',
    text: 'Message 2',
    my: true,
    timestamp: 1_760_611_617_121,
    title: 'User 2',
    isRead: false,
  },
];

describe('NotifyAboutUnreadMessages', () => {
  let instance: TInstance;
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;
  let reaction: NotifyAboutUnreadMessages;

  beforeEach(() => {
    jest.useFakeTimers();

    instance = Model.create();

    mockCoreApi = new CoreApi();
    // Оборачиваем только методы, которые проверяются в тестах, но не action методы MobX
    jest.spyOn(mockCoreApi, 'notifyAboutOneNewMessage');
    jest.spyOn(mockCoreApi, 'notifyAboutManyNewMessages');
    mockServerApi = wrapMethodsWithJestFunction(new ServerApi());

    reaction = new NotifyAboutUnreadMessages({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
      executableActions: {},
    });

    reaction.start();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('должен вызывать notifyAboutOneNewMessage при одном непрочитанном', () => {
    instance.setMessages(oneUnread);

    jest.advanceTimersByTime(DEBOUNCE_TIME);

    expect(mockCoreApi.notifyAboutOneNewMessage).toHaveBeenCalledTimes(1);
    expect(mockCoreApi.notifyAboutOneNewMessage).toHaveBeenCalledWith({
      title: 'User 1',
      text: 'Message 1',
    });
    expect(mockCoreApi.notifyAboutManyNewMessages).not.toHaveBeenCalled();
  });

  it('должен вызывать notifyAboutManyNewMessages при нескольких непрочитанных', () => {
    instance.setMessages(manyUnread);

    jest.advanceTimersByTime(DEBOUNCE_TIME);

    expect(mockCoreApi.notifyAboutManyNewMessages).toHaveBeenCalledTimes(1);
    expect(mockCoreApi.notifyAboutManyNewMessages).toHaveBeenCalledWith([
      { title: 'User 1', text: 'Message 1' },
      { title: 'User 2', text: 'Message 2' },
    ]);
    expect(mockCoreApi.notifyAboutOneNewMessage).not.toHaveBeenCalled();
  });

  it('debounce: несколько быстрых изменений приводят к одному уведомлению', () => {
    instance.setMessages(oneUnread);
    instance.markAllAsRead();

    expect(instance.isUnreadMessages).toBe(false);

    instance.setMessages(manyUnread);

    expect(instance.isUnreadMessages).toBe(true);

    jest.advanceTimersByTime(DEBOUNCE_TIME);

    expect(mockCoreApi.notifyAboutManyNewMessages).toHaveBeenCalledTimes(1);
    expect(mockCoreApi.notifyAboutOneNewMessage).not.toHaveBeenCalled();
  });

  it('должен отменять отложенное уведомление когда hasAvailable => false', () => {
    instance.setMessages(oneUnread);

    mockCoreApi.setIsAvailable(true);
    mockCoreApi.setIsAvailable(false);

    jest.advanceTimersByTime(DEBOUNCE_TIME);

    expect(mockCoreApi.notifyAboutOneNewMessage).not.toHaveBeenCalled();
    expect(mockCoreApi.notifyAboutManyNewMessages).not.toHaveBeenCalled();
  });

  describe('отписка при остановки реакции', () => {
    it('должен отписаться от реакции оповещения', () => {
      instance.setMessages(oneUnread);

      jest.advanceTimersByTime(DEBOUNCE_TIME);

      expect(mockCoreApi.notifyAboutOneNewMessage).toHaveBeenCalledTimes(1);

      reaction.stop();

      jest.clearAllMocks();

      instance.markAllAsRead();
      instance.setMessages(manyUnread);

      expect(mockCoreApi.notifyAboutOneNewMessage).not.toHaveBeenCalled();
      expect(mockCoreApi.notifyAboutManyNewMessages).not.toHaveBeenCalled();
    });

    it('должен отменять отложенное уведомление', () => {
      instance.setMessages(oneUnread);

      reaction.stop();

      jest.advanceTimersByTime(DEBOUNCE_TIME);

      expect(mockCoreApi.notifyAboutOneNewMessage).not.toHaveBeenCalled();
      expect(mockCoreApi.notifyAboutManyNewMessages).not.toHaveBeenCalled();
    });
  });

  it('должен подставлять читаемый текст для опроса', () => {
    const pollText = encodePoll({
      pollId: 'poll-1',
      question: 'Какой вариант?',
      options: ['A', 'B'],
      mode: 'multiple',
    });

    instance.setMessages([
      {
        id: '1',
        text: pollText,
        my: false,
        timestamp: 1,
        title: 'User',
        isRead: false,
      },
    ]);

    jest.advanceTimersByTime(DEBOUNCE_TIME);

    expect(mockCoreApi.notifyAboutOneNewMessage).toHaveBeenCalledWith({
      title: 'User',
      text: 'Опрос: Какой вариант?',
    });
  });

  it('должен подставлять читаемый текст для голоса', () => {
    const voteText = encodeVote({ pollId: 'poll-1', optionIndex: 0 });

    instance.setMessages([
      {
        id: '1',
        text: voteText,
        my: false,
        timestamp: 1,
        title: 'Voter',
        isRead: false,
      },
    ]);

    jest.advanceTimersByTime(DEBOUNCE_TIME);

    expect(mockCoreApi.notifyAboutOneNewMessage).toHaveBeenCalledWith({
      title: 'Voter',
      text: 'Голос в опросе',
    });
  });
});
