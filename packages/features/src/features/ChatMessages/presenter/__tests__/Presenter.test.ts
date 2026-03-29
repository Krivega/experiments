import Presenter from '../Presenter';

import type { TStore } from '../../store';

describe('Presenter', () => {
  let presenter: Presenter;
  const store = {
    state: {
      getFeedItems: jest.fn(),
      getCountUnreadMessages: jest.fn(),
      hasMyVoteForPoll: jest.fn(),
      hasUnreadMessages: jest.fn(),
    },
    executableActions: {
      deleteMessage: {
        execute: jest.fn(),
      },
      sendVote: {
        execute: jest.fn(),
        canExecute: jest.fn(),
      },
      resetVote: {
        execute: jest.fn(),
        canExecute: jest.fn(),
      },
    },
    destroy: jest.fn(),
  };

  beforeEach(() => {
    presenter = new Presenter({ store: store as unknown as TStore });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен вызывать destroy при вызове диспозера', () => {
    const disposer = presenter.init();

    disposer();

    expect(store.destroy).toHaveBeenCalledTimes(1);
  });

  it('должен возвращать все необходимые свойства', () => {
    const props = presenter.createPropsView();

    expect(props.getFeedItems).toBeDefined();
    expect(props.getCountUnreadMessages).toBeDefined();
    expect(props.hasUnreadMessages).toBeDefined();
    expect(props.onDeleteMessage).toBeDefined();
    expect(props.onVote).toBeDefined();
    expect(props.onResetVote).toBeDefined();
    expect(props.hasMyVoteForPoll).toBeDefined();
    expect(props.hasAvailableResetVote).toBeDefined();
  });

  it('должен возвращать преобразованные сообщения', () => {
    const transformedMessages = [
      {
        type: 'message' as const,
        id: '1',
        text: 'Hello%20World!',
        timestamp: 1_234_567_890,
        isDeletable: true,
        author: 'User1',
      },
    ];

    store.state.getFeedItems.mockReturnValue(transformedMessages);

    const result = presenter.createPropsView().getFeedItems();

    expect(result).toEqual(transformedMessages);
  });

  it('должен вызывать sendVote.execute при голосовании', () => {
    const pollId = 'poll-uuid-1';
    const optionIndex = 0;

    const props = presenter.createPropsView();

    props.onVote(pollId, optionIndex);

    expect(store.executableActions.sendVote.execute).toHaveBeenCalledTimes(1);
    expect(store.executableActions.sendVote.execute).toHaveBeenCalledWith({
      pollId,
      optionIndex,
    });
  });

  it('должен проверять наличие моего голоса в опросе через store.state.hasMyVoteForPoll', () => {
    const pollId = 'poll-uuid-1';

    store.state.hasMyVoteForPoll.mockReturnValue(true);

    const props = presenter.createPropsView();

    const result = props.hasMyVoteForPoll(pollId);

    expect(store.state.hasMyVoteForPoll).toHaveBeenCalledTimes(1);
    expect(store.state.hasMyVoteForPoll).toHaveBeenCalledWith(pollId);
    expect(result).toBe(true);
  });

  it('должен вызывать resetVote.execute при отзыве голоса', () => {
    const pollId = 'poll-uuid-1';

    const props = presenter.createPropsView();

    props.onResetVote(pollId);

    expect(store.executableActions.resetVote.execute).toHaveBeenCalledTimes(1);
    expect(store.executableActions.resetVote.execute).toHaveBeenCalledWith({ pollId });
  });

  it('должен проверять возможность отзыва голоса через resetVote.canExecute', () => {
    const pollId = 'poll-uuid-1';

    store.executableActions.resetVote.canExecute.mockReturnValue(true);

    const props = presenter.createPropsView();

    const result = props.hasAvailableResetVote(pollId);

    expect(store.executableActions.resetVote.canExecute).toHaveBeenCalledTimes(1);
    expect(store.executableActions.resetVote.canExecute).toHaveBeenCalledWith({ pollId });
    expect(result).toBe(true);
  });

  it('должен возвращать опрос и агрегировать голоса, скрывая сообщения-голоса', () => {
    const pollId = 'poll-uuid-1';
    const transformedMessages = [
      {
        type: 'poll' as const,
        messageId: 'msg-1',
        author: 'Author1',
        timestamp: 1000,
        isDeletable: true,
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        votesByOptionIndex: { 0: ['Voter1'] },
      },
    ];

    store.state.getFeedItems.mockReturnValue(transformedMessages);

    const result = presenter.createPropsView().getFeedItems();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      type: 'poll',
      messageId: 'msg-1',
      pollId,
      question: 'Question?',
      options: ['A', 'B'],
      votesByOptionIndex: { 0: ['Voter1'] },
    });
  });
});
