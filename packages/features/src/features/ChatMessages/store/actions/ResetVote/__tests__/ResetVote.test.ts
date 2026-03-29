import { flushPromises } from '@experiments/test-utils';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { encodeVote } from '../../../../../../shared/voteEncoding/voteEncoding';
import { Model } from '../../../@Model';
import { CoreApi, ServerApi } from '../../../__fixtures__';
import ResetVote from '../ResetVote';

import type { TInstance } from '../../../@Model';

describe('ResetVote', () => {
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;

  let action: ResetVote;
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();

    mockCoreApi = new CoreApi();
    mockServerApi = wrapMethodsWithJestFunction(new ServerApi());

    action = new ResetVote({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: mockCoreApi,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен удалять все мои сообщения-голоса по pollId', async () => {
    const pollId = 'poll-uuid-1';

    const firstVoteText = encodeVote({ pollId, optionIndex: 0 });
    const secondVoteText = encodeVote({ pollId, optionIndex: 1 });
    const otherPollVoteText = encodeVote({ pollId: 'other-poll', optionIndex: 0 });

    instance.setMessages([
      {
        id: 'vote-message-1',
        text: firstVoteText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_120,
        title: 'Me',
      },
      {
        id: 'vote-message-2',
        text: secondVoteText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_121,
        title: 'Me',
      },
      {
        id: 'vote-message-other-poll',
        text: otherPollVoteText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_122,
        title: 'Me',
      },
      {
        id: 'vote-message-not-my',
        text: firstVoteText,
        isRead: false,
        my: false,
        timestamp: 1_760_611_617_123,
        title: 'Other',
      },
    ]);

    action.execute({ pollId });

    await flushPromises();

    expect(mockServerApi.deleteMessage).toHaveBeenCalledTimes(2);
    expect(mockServerApi.deleteMessage).toHaveBeenCalledWith('vote-message-1');
    expect(mockServerApi.deleteMessage).toHaveBeenCalledWith('vote-message-2');
  });

  it('не должен вызывать deleteMessage, если голосов по pollId нет', async () => {
    const pollId = 'poll-uuid-2';

    const otherPollVoteText = encodeVote({ pollId: 'other-poll', optionIndex: 0 });

    instance.setMessages([
      {
        id: 'vote-message-other-poll',
        text: otherPollVoteText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_120,
        title: 'Me',
      },
    ]);

    action.execute({ pollId });

    await flushPromises();

    expect(mockServerApi.deleteMessage).not.toHaveBeenCalled();
  });

  it('должен удалять один голос для single-опроса', async () => {
    const pollId = 'poll-single-1';
    const voteText = encodeVote({ pollId, optionIndex: 0 });

    instance.setMessages([
      {
        id: 'vote-message-single',
        text: voteText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_120,
        title: 'Me',
      },
    ]);

    action.execute({ pollId });

    await flushPromises();

    expect(mockServerApi.deleteMessage).toHaveBeenCalledTimes(1);
    expect(mockServerApi.deleteMessage).toHaveBeenCalledWith('vote-message-single');
  });

  describe('canExecute', () => {
    it('должен возвращать true, когда есть мои голоса по pollId', () => {
      const pollId = 'poll-uuid-1';
      const voteText = encodeVote({ pollId, optionIndex: 0 });

      instance.setMessages([
        {
          id: 'vote-message',
          text: voteText,
          isRead: false,
          my: true,
          timestamp: 1_760_611_617_120,
          title: 'Me',
        },
      ]);

      expect(action.canExecute({ pollId })).toBe(true);
    });

    it('должен возвращать false, когда нет моих голосов по pollId', () => {
      const pollId = 'poll-uuid-1';

      instance.setMessages([]);

      expect(action.canExecute({ pollId })).toBe(false);
    });

    it('должен возвращать false, когда голоса относятся к другому опросу', () => {
      const pollId = 'poll-target';
      const otherPollVoteText = encodeVote({ pollId: 'other-poll', optionIndex: 0 });

      instance.setMessages([
        {
          id: 'vote-message-other',
          text: otherPollVoteText,
          isRead: false,
          my: true,
          timestamp: 1_760_611_617_120,
          title: 'Me',
        },
      ]);

      expect(action.canExecute({ pollId })).toBe(false);
    });

    it('должен возвращать false, когда есть голоса другого пользователя по pollId', () => {
      const pollId = 'poll-uuid-1';
      const voteText = encodeVote({ pollId, optionIndex: 0 });

      instance.setMessages([
        {
          id: 'vote-message-other-user',
          text: voteText,
          isRead: false,
          my: false,
          timestamp: 1_760_611_617_120,
          title: 'Other',
        },
      ]);

      expect(action.canExecute({ pollId })).toBe(false);
    });
  });

  describe('execute при canExecute false', () => {
    it('не должен вызывать deleteMessage при execute, если canExecute false', async () => {
      const pollId = 'poll-empty';

      instance.setMessages([]);

      expect(action.canExecute({ pollId })).toBe(false);

      action.execute({ pollId });

      await flushPromises();

      expect(mockServerApi.deleteMessage).not.toHaveBeenCalled();
    });
  });
});
