import { Model } from '../../@Model';
import { CoreApi, ServerApi } from '../../__fixtures__';
import MarkAllMessagesAsRead from '../MarkAllMessagesAsRead';

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
    isRead: false,
  },
];

describe('MarkAllMessagesAsRead', () => {
  let instance: TInstance;
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;
  let reaction: MarkAllMessagesAsRead;

  beforeEach(() => {
    instance = Model.create();

    mockCoreApi = new CoreApi();
    mockServerApi = new ServerApi();

    reaction = new MarkAllMessagesAsRead({
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
    reaction.stop();
  });

  it('не должен помечать сообщения как прочитанные если isShown = false', () => {
    instance.setMessages(mockMessages);

    expect(instance.isUnreadMessages).toBe(true);
    expect(instance.countUnreadMessages).toBe(2);
  });

  it('не должен помечать сообщения как прочитанные если isUnreadMessages = false', () => {
    mockCoreApi.setIsShown(true);

    expect(instance.isUnreadMessages).toBe(false);
    expect(instance.countUnreadMessages).toBe(0);
  });

  it('должен помечать все сообщения как прочитанные когда isShown = true и isUnreadMessages = true', () => {
    instance.setMessages(mockMessages);

    expect(instance.isUnreadMessages).toBe(true);
    expect(instance.countUnreadMessages).toBe(2);

    mockCoreApi.setIsShown(true);

    expect(instance.isUnreadMessages).toBe(false);
    expect(instance.countUnreadMessages).toBe(0);
    expect(instance.readMessagesInstances.length).toBe(2);
  });

  it('должен помечать сообщения как прочитанные когда isUnreadMessages меняется с false на true при isShown = true', () => {
    mockCoreApi.setIsShown(true);

    expect(instance.isUnreadMessages).toBe(false);

    instance.setMessages(mockMessages);

    expect(instance.isUnreadMessages).toBe(false);
    expect(instance.countUnreadMessages).toBe(0);
    expect(instance.readMessagesInstances.length).toBe(2);
  });

  it('должен перестать реагировать на изменения после остановки реакции', () => {
    instance.setMessages(mockMessages);

    expect(instance.isUnreadMessages).toBe(true);
    expect(instance.countUnreadMessages).toBe(2);

    reaction.stop();

    mockCoreApi.setIsShown(true);

    expect(instance.isUnreadMessages).toBe(true);
    expect(instance.countUnreadMessages).toBe(2);
  });
});
