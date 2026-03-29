import { flushPromises } from '@experiments/test-utils';

import { wrapMethodsWithJestFunction } from '@/shared/__tests-utils__';
import { encodePoll, encodeVote } from '../../../../../../shared/voteEncoding/voteEncoding';
import { Model } from '../../../@Model';
import { CoreApi, ServerApi } from '../../../__fixtures__';
import SendVote from '../SendVote';

import type { TInstance } from '../../../@Model';

describe('SendVote', () => {
  let mockCoreApi: CoreApi;
  let mockServerApi: ServerApi;

  let action: SendVote;
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();

    mockCoreApi = new CoreApi();
    mockServerApi = wrapMethodsWithJestFunction(new ServerApi());

    action = new SendVote({
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

  it('должен вызывать serverApi.sendMessage с закодированным голосом', async () => {
    const pollId = 'poll-uuid-1';
    const optionIndex = 0;

    action.execute({ pollId, optionIndex });

    await flushPromises();

    expect(mockServerApi.sendMessage).toHaveBeenCalledTimes(1);

    // @ts-expect-error
    const [encoded] = jest.mocked(mockServerApi.sendMessage).mock.calls[0];

    expect(encoded).toContain('[VOTE]');
    expect(encoded).toContain(pollId);
    expect(encoded).toContain(JSON.stringify(optionIndex));
  });

  it('должен передавать разные pollId и optionIndex', async () => {
    action.execute({ pollId: 'poll-a', optionIndex: 0 });
    action.execute({ pollId: 'poll-b', optionIndex: 2 });

    await flushPromises();

    expect(mockServerApi.sendMessage).toHaveBeenCalledTimes(2);

    // @ts-expect-error
    const [first] = jest.mocked(mockServerApi.sendMessage).mock.calls[0];
    // @ts-expect-error
    const [second] = jest.mocked(mockServerApi.sendMessage).mock.calls[1];

    expect(first).toContain('poll-a');
    expect(first).toContain('0');
    expect(second).toContain('poll-b');
    expect(second).toContain('2');
  });

  it('не должен отправлять голос повторно за один и тот же option', async () => {
    const pollId = 'poll-uuid-1';
    const optionIndex = 0;
    const pollText = encodePoll({
      pollId,
      question: 'Question?',
      options: ['A', 'B'],
      mode: 'multiple',
    });
    const voteText = encodeVote({ pollId, optionIndex });

    instance.setMessages([
      {
        id: 'poll-message',
        text: pollText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_120,
        title: 'Me',
      },
      {
        id: 'vote-message',
        text: voteText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_121,
        title: 'Me',
      },
    ]);

    action.execute({ pollId, optionIndex });

    await flushPromises();

    expect(mockServerApi.sendMessage).not.toHaveBeenCalled();
  });

  it('должен позволять голосовать за другой option в multiple-опросе', async () => {
    const pollId = 'poll-uuid-2';
    const firstOptionIndex = 0;
    const secondOptionIndex = 1;
    const pollText = encodePoll({
      pollId,
      question: 'Question?',
      options: ['A', 'B'],
      mode: 'multiple',
    });
    const firstVoteText = encodeVote({ pollId, optionIndex: firstOptionIndex });

    instance.setMessages([
      {
        id: 'poll-message',
        text: pollText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_120,
        title: 'Me',
      },
      {
        id: 'vote-message',
        text: firstVoteText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_121,
        title: 'Me',
      },
    ]);

    action.execute({ pollId, optionIndex: secondOptionIndex });

    await flushPromises();

    expect(mockServerApi.sendMessage).toHaveBeenCalledTimes(1);

    // @ts-expect-error
    const [encoded] = jest.mocked(mockServerApi.sendMessage).mock.calls[0];

    expect(encoded).toContain('[VOTE]');
    expect(encoded).toContain(pollId);
    expect(encoded).toContain(JSON.stringify(secondOptionIndex));
  });

  it('не должен позволять повторный голос в single-опросе даже за другой option', async () => {
    const pollId = 'poll-single-1';
    const pollText = encodePoll({
      pollId,
      question: 'Question?',
      options: ['A', 'B'],
      mode: 'single',
    });
    const existingVoteText = encodeVote({ pollId, optionIndex: 0 });

    instance.setMessages([
      {
        id: 'poll-message',
        text: pollText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_120,
        title: 'Me',
      },
      {
        id: 'vote-message',
        text: existingVoteText,
        isRead: false,
        my: true,
        timestamp: 1_760_611_617_121,
        title: 'Me',
      },
    ]);

    action.execute({ pollId, optionIndex: 1 });

    await flushPromises();

    expect(mockServerApi.sendMessage).not.toHaveBeenCalled();
  });
});
