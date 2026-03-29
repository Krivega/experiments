import { encodePoll, encodeVote } from '../../../../../shared/voteEncoding/voteEncoding';
import Model from '../Model';

import type { TInstance } from '../Model';

const mockMessage = (id: string, text: string, isRead = false) => {
  return {
    id,
    text,
    isRead,
    my: false,
    timestamp: 1_760_611_617_120,
    title: `User ${id}`,
  };
};

const mockMessages = [
  mockMessage('1', 'Message 1'),
  mockMessage('2', 'Message 2'),
  mockMessage('3', 'Message 3'),
  mockMessage('4', 'Message 4'),
];

describe('Модель', () => {
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();
  });

  it('инициализация', () => {
    expect(instance.messages.length).toBe(0);
    expect(instance.unreadMessages.length).toBe(0);
    expect(instance.unreadMessagesInstances.length).toBe(0);
    expect(instance.readMessagesInstances.length).toBe(0);
    expect(instance.countUnreadMessages).toBe(0);
    expect(instance.isUnreadMessages).toBe(false);
  });

  describe('setMessages', () => {
    it('должен устанавливать сообщения', () => {
      instance.setMessages(mockMessages);

      expect(instance.messages.length).toBe(4);
      expect(instance.unreadMessages.length).toBe(4);
      expect(instance.unreadMessagesInstances.length).toBe(4);
      expect(instance.readMessagesInstances.length).toBe(0);
      expect(instance.countUnreadMessages).toBe(4);
      expect(instance.isUnreadMessages).toBe(true);
    });

    it('должен корректно обрабатывать смешанные прочитанные и непрочитанные сообщения', () => {
      const readMessages = [
        mockMessage('1', 'Read message 1', true),
        mockMessage('2', 'Read message 2', true),
      ];
      const unreadMessages = [
        mockMessage('3', 'Unread message 1'),
        mockMessage('4', 'Unread message 2'),
      ];
      const allMessages = [...readMessages, ...unreadMessages];

      instance.setMessages(allMessages);

      expect(instance.messages.length).toBe(4);
      expect(instance.readMessagesInstances.length).toBe(2);
      expect(instance.unreadMessages.length).toBe(2);
      expect(instance.countUnreadMessages).toBe(2);
      expect(instance.isUnreadMessages).toBe(true);
    });

    it('должен сохранять статус прочтения при обновлении сообщений', () => {
      instance.setMessages(mockMessages);
      instance.markAllAsRead();

      expect(instance.readMessagesInstances.length).toBe(4);
      expect(instance.unreadMessages.length).toBe(0);
      expect(instance.countUnreadMessages).toBe(0);
      expect(instance.isUnreadMessages).toBe(false);

      const newMessages = [mockMessage('5', 'New message 1'), mockMessage('6', 'New message 2')];

      instance.setMessages([...mockMessages, ...newMessages]);

      expect(instance.readMessagesInstances.length).toBe(4);
      expect(instance.unreadMessages.length).toBe(2);
      expect(instance.countUnreadMessages).toBe(2);
      expect(instance.isUnreadMessages).toBe(true);
    });

    it('должен очищать старые сообщения, если количество новых сообщений отличается', () => {
      instance.setMessages(mockMessages);
      instance.markAllAsRead();

      const completelyNewMessages = [mockMessage('10', 'New 1'), mockMessage('11', 'New 2')];

      instance.setMessages(completelyNewMessages);

      expect(instance.messages.length).toBe(2);
      expect(instance.readMessagesInstances.length).toBe(0);
      expect(instance.unreadMessages.length).toBe(2);
      expect(instance.countUnreadMessages).toBe(2);
    });

    it('должен очищать старые сообщения при одинаковом количестве новых сообщений', () => {
      instance.setMessages(mockMessages);

      const updatedMessages = mockMessages.map((message, index) => {
        return { ...message, id: `${11 + index}` };
      });

      instance.setMessages(updatedMessages);

      expect(instance.readMessagesInstances.length).toBe(0);
      expect(instance.unreadMessages.length).toBe(4);
      expect(
        instance.messages.map((message) => {
          return message.id;
        }),
      ).toEqual(['11', '12', '13', '14']);
    });

    it('должен очищать старые сообщения, если отличается только последнее сообщение', () => {
      instance.setMessages(mockMessages);

      const updatedMessages = [
        mockMessages[0],
        mockMessages[1],
        mockMessages[2],
        { ...mockMessages[3], id: '10' },
      ];

      instance.setMessages(updatedMessages);

      expect(instance.readMessagesInstances.length).toBe(0);
      expect(instance.unreadMessages.length).toBe(4);
      expect(
        instance.messages.map((message) => {
          return message.id;
        }),
      ).toEqual(['1', '2', '3', '10']);
    });

    it('должен сохранять статус прочтения при обновлении сообщений с теми же ID', () => {
      instance.setMessages(mockMessages);
      instance.markAllAsRead();

      const updatedMessages = mockMessages.map((message, index) => {
        return { ...message, text: `Updated ${index + 1}` };
      });

      instance.setMessages(updatedMessages);

      expect(instance.readMessagesInstances.length).toBe(4);
      expect(instance.unreadMessages.length).toBe(0);
      expect(
        instance.messages.map((message) => {
          return message.text;
        }),
      ).toEqual(['Updated 1', 'Updated 2', 'Updated 3', 'Updated 4']);
    });
  });

  describe('clearMessages', () => {
    it('должен очищать список сообщений', () => {
      instance.setMessages(mockMessages);

      expect(instance.messages.length).not.toBe(0);

      instance.clearMessages();

      expect(instance.messages.length).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('должен помечать все сообщения как прочитанные', () => {
      instance.setMessages(mockMessages);

      expect(instance.isUnreadMessages).toBe(true);
      expect(instance.unreadMessages.length).toBe(4);
      expect(instance.countUnreadMessages).toBe(4);

      instance.markAllAsRead();

      expect(instance.isUnreadMessages).toBe(false);
      expect(instance.unreadMessages.length).toBe(0);
      expect(instance.readMessagesInstances.length).toBe(4);
      expect(instance.countUnreadMessages).toBe(0);
    });

    it('должен помечать как прочитанные только непрочитанные сообщения', () => {
      const readMessages = [mockMessage('1', 'Read message 1', true)];
      const unreadMessages = [
        mockMessage('2', 'Unread message 1'),
        mockMessage('3', 'Unread message 2'),
      ];
      const allMessages = [...readMessages, ...unreadMessages];

      instance.setMessages(allMessages);

      expect(instance.isUnreadMessages).toBe(true);
      expect(instance.countUnreadMessages).toBe(2);

      instance.markAllAsRead();

      expect(instance.isUnreadMessages).toBe(false);
      expect(instance.unreadMessages.length).toBe(0);
      expect(instance.readMessagesInstances.length).toBe(3);
      expect(instance.countUnreadMessages).toBe(0);
    });
  });

  describe('voteToMessage', () => {
    it('должен возвращать закодированный текст голоса для pollId и optionIndex', () => {
      const pollId = 'poll-123';
      const optionIndex = 0;

      const result = instance.voteToMessage(pollId, optionIndex);

      expect(result).toBe(encodeVote({ pollId, optionIndex }));
      expect(result).toContain('[VOTE]');
      expect(JSON.parse(result.replace('[VOTE]', '').trim())).toEqual({ pollId, optionIndex });
    });

    it('должен возвращать разные строки для разных optionIndex', () => {
      const pollId = 'same-poll';

      const vote0 = instance.voteToMessage(pollId, 0);
      const vote1 = instance.voteToMessage(pollId, 1);

      expect(vote0).not.toBe(vote1);
      expect(vote0).toBe(encodeVote({ pollId, optionIndex: 0 }));
      expect(vote1).toBe(encodeVote({ pollId, optionIndex: 1 }));
    });

    it('должен возвращать разные строки для разных pollId', () => {
      const optionIndex = 0;

      const voteA = instance.voteToMessage('poll-a', optionIndex);
      const voteB = instance.voteToMessage('poll-b', optionIndex);

      expect(voteA).not.toBe(voteB);
      expect(voteA).toBe(encodeVote({ pollId: 'poll-a', optionIndex }));
      expect(voteB).toBe(encodeVote({ pollId: 'poll-b', optionIndex }));
    });
  });

  describe('hasMyVoteForOption', () => {
    it('должен возвращать true, если есть мой голос за указанный option', () => {
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
          ...mockMessage('poll-message', pollText),
          my: true,
        },
        {
          ...mockMessage('vote-message', voteText),
          my: true,
        },
      ]);

      expect(instance.hasMyVoteForOption(pollId, optionIndex)).toBe(true);
    });

    it('должен возвращать false, если есть голос другого пользователя за указанный option', () => {
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
          ...mockMessage('poll-message', pollText),
          my: true,
        },
        {
          ...mockMessage('vote-message', voteText),
          my: false,
        },
      ]);

      expect(instance.hasMyVoteForOption(pollId, optionIndex)).toBe(false);
    });

    it('должен возвращать false, если нет голоса за указанный option', () => {
      const pollId = 'poll-uuid-1';
      const optionIndex = 0;
      const pollText = encodePoll({
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });

      instance.setMessages([
        {
          ...mockMessage('poll-message', pollText),
          my: true,
        },
      ]);

      expect(instance.hasMyVoteForOption(pollId, optionIndex)).toBe(false);
    });

    it('должен возвращать false, если есть мой голос за другой poll или option', () => {
      const pollId = 'poll-uuid-1';
      const optionIndex = 0;
      const pollText = encodePoll({
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });
      const otherVoteText = encodeVote({ pollId: 'other-poll', optionIndex: 1 });

      instance.setMessages([
        {
          ...mockMessage('poll-message', pollText),
          my: true,
        },
        {
          ...mockMessage('vote-message', otherVoteText),
          my: true,
        },
      ]);

      expect(instance.hasMyVoteForOption(pollId, optionIndex)).toBe(false);
    });
  });

  describe('hasMyVoteForPoll', () => {
    it('должен возвращать true, если есть хотя бы один мой голос за опрос', () => {
      const pollId = 'poll-has-my-vote';
      const pollText = encodePoll({
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });
      const voteText = encodeVote({ pollId, optionIndex: 1 });

      instance.setMessages([
        {
          ...mockMessage('poll-message', pollText),
          my: true,
        },
        {
          ...mockMessage('vote-message', voteText),
          my: true,
        },
      ]);

      expect(instance.hasMyVoteForPoll(pollId)).toBe(true);
    });

    it('должен возвращать false, если нет моих голосов за опрос', () => {
      const pollId = 'poll-no-my-vote';
      const pollText = encodePoll({
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });
      const voteText = encodeVote({ pollId, optionIndex: 0 });

      instance.setMessages([
        {
          ...mockMessage('poll-message', pollText),
          my: true,
        },
        {
          ...mockMessage('vote-message', voteText),
          my: false,
        },
      ]);

      expect(instance.hasMyVoteForPoll(pollId)).toBe(false);
    });

    it('должен возвращать false, если мой голос относится к другому опросу', () => {
      const pollId = 'poll-target';
      const otherPollId = 'poll-other';
      const pollText = encodePoll({
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });
      const otherPollText = encodePoll({
        pollId: otherPollId,
        question: 'Other?',
        options: ['X', 'Y'],
        mode: 'multiple',
      });
      const otherVoteText = encodeVote({ pollId: otherPollId, optionIndex: 0 });

      instance.setMessages([
        {
          ...mockMessage('poll-message', pollText),
          my: true,
        },
        {
          ...mockMessage('other-poll-message', otherPollText),
          my: true,
        },
        {
          ...mockMessage('other-vote-message', otherVoteText),
          my: true,
        },
      ]);

      expect(instance.hasMyVoteForPoll(pollId)).toBe(false);
    });
  });

  describe('hasMultipleChoicePoll', () => {
    it('должен возвращать true для multiple-опроса', () => {
      const pollId = 'poll-multiple';
      const pollText = encodePoll({
        pollId,
        question: 'Multiple?',
        options: ['A', 'B'],
        mode: 'multiple',
      });

      instance.setMessages([
        {
          ...mockMessage('poll-message', pollText),
          my: true,
        },
      ]);

      expect(instance.hasMultipleChoicePoll(pollId)).toBe(true);
    });

    it('должен возвращать false для single-опроса', () => {
      const pollId = 'poll-single';
      const pollText = encodePoll({
        pollId,
        question: 'Single?',
        options: ['A', 'B'],
        mode: 'single',
      });

      instance.setMessages([
        {
          ...mockMessage('poll-message', pollText),
          my: true,
        },
      ]);

      expect(instance.hasMultipleChoicePoll(pollId)).toBe(false);
    });

    it('должен возвращать true, если опрос с таким pollId не найден', () => {
      const pollId = 'poll-not-found';

      instance.setMessages([mockMessage('1', 'Just text')]);

      expect(instance.hasMultipleChoicePoll(pollId)).toBe(true);
    });
  });

  describe('myVotesForPoll', () => {
    it('должен возвращать массив моих голосов по pollId', () => {
      const pollId = 'poll-my-votes';
      const pollText = encodePoll({
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });
      const myFirstVoteText = encodeVote({ pollId, optionIndex: 0 });
      const mySecondVoteText = encodeVote({ pollId, optionIndex: 1 });
      const otherPollVoteText = encodeVote({ pollId: 'other-poll', optionIndex: 0 });

      instance.setMessages([
        {
          ...mockMessage('poll-message', pollText),
          my: true,
        },
        {
          ...mockMessage('my-vote-1', myFirstVoteText),
          my: true,
        },
        {
          ...mockMessage('my-vote-2', mySecondVoteText),
          my: true,
        },
        {
          ...mockMessage('other-poll-vote', otherPollVoteText),
          my: true,
        },
        {
          ...mockMessage('not-my-vote', myFirstVoteText),
          my: false,
        },
      ]);

      const result = instance.myVotesForPoll(pollId);

      expect(result).toHaveLength(2);
      expect(
        result.map((item) => {
          return item.id;
        }),
      ).toEqual(['my-vote-1', 'my-vote-2']);
      result.forEach((item) => {
        expect(item.type).toBe('vote');
        expect(item.pollId).toBe(pollId);
        expect(item.isMy).toBe(true);
      });
    });

    it('должен возвращать пустой массив, если нет моих голосов по pollId', () => {
      const pollId = 'poll-no-my-votes';
      const voteText = encodeVote({ pollId, optionIndex: 0 });

      instance.setMessages([
        {
          ...mockMessage('not-my-vote', voteText),
          my: false,
        },
      ]);

      const result = instance.myVotesForPoll(pollId);

      expect(result).toEqual([]);
    });
  });

  describe('feedItems', () => {
    it('должен возвращать plain-сообщения как message item с декодированным текстом', () => {
      instance.setMessages([mockMessage('1', 'Hello%20World%21')]);

      const items = instance.feedItems;

      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        type: 'message',
        id: '1',
        text: 'Hello%20World!',
        author: 'User 1',
      });
    });

    it('должен возвращать опрос и агрегировать голоса, скрывая сообщения-голоса', () => {
      const pollId = 'poll-uuid-1';
      const pollText = encodePoll({
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });
      const voteText = encodeVote({ pollId, optionIndex: 0 });

      instance.setMessages([
        {
          ...mockMessage('msg-1', pollText),
          title: 'Author1',
          my: true,
        },
        {
          ...mockMessage('msg-2', voteText),
          title: 'Voter1',
          my: false,
        },
      ]);

      const items = instance.feedItems;

      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        type: 'poll',
        messageId: 'msg-1',
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        votesByOptionIndex: { 0: ['Voter1'] },
      });
    });

    it('должен возвращать опрос без голосов с пустым списком голосов', () => {
      const pollId = 'poll-without-votes';
      const pollText = encodePoll({
        pollId,
        question: 'No votes?',
        options: ['A', 'B'],
        mode: 'multiple',
      });

      instance.setMessages([
        {
          ...mockMessage('msg-1', pollText),
          title: 'Author1',
          my: true,
        },
      ]);

      const items = instance.feedItems;

      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        type: 'poll',
        messageId: 'msg-1',
        pollId,
        question: 'No votes?',
        options: ['A', 'B'],
      });
      // @ts-expect-error
      expect(items[0].votesByOptionIndex).toEqual([]);
    });
  });

  describe('parsedMessages', () => {
    it('должен возвращать пустой массив при отсутствии сообщений', () => {
      expect(instance.parsedMessages).toEqual([]);
    });

    it('должен возвращать plain с meta (id, timestamp, isDeletable, author, text)', () => {
      instance.setMessages([mockMessage('1', 'Hello world')]);

      const parsed = instance.parsedMessages;

      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        type: 'plain',
        id: '1',
        author: 'User 1',
        text: 'Hello world',
      });
      expect(parsed[0]).toHaveProperty('timestamp');
      expect(parsed[0]).toHaveProperty('isDeletable');
    });

    it('должен возвращать poll с meta (id, timestamp, isDeletable, author)', () => {
      const pollId = 'poll-1';
      const pollText = encodePoll({
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });

      instance.setMessages([mockMessage('msg-1', pollText)]);

      const parsed = instance.parsedMessages;

      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        type: 'poll',
        pollId,
        question: 'Question?',
        options: ['A', 'B'],
        id: 'msg-1',
        author: 'User msg-1',
      });
      expect(parsed[0]).toHaveProperty('timestamp');
      expect(parsed[0]).toHaveProperty('isDeletable');
    });

    it('должен возвращать vote с meta (id, timestamp, isDeletable, author)', () => {
      const pollId = 'poll-2';
      const optionIndex = 1;
      const voteText = encodeVote({ pollId, optionIndex });

      instance.setMessages([mockMessage('msg-2', voteText)]);

      const parsed = instance.parsedMessages;

      expect(parsed).toHaveLength(1);
      expect(parsed[0]).toMatchObject({
        type: 'vote',
        pollId,
        optionIndex,
        id: 'msg-2',
        author: 'User msg-2',
      });
      expect(parsed[0]).toHaveProperty('timestamp');
      expect(parsed[0]).toHaveProperty('isDeletable');
    });

    it('должен возвращать массив parsed по порядку сообщений с meta', () => {
      const pollText = encodePoll({
        pollId: 'p1',
        question: 'Q?',
        options: ['X', 'Y'],
        mode: 'multiple',
      });
      const voteText = encodeVote({ pollId: 'p1', optionIndex: 0 });

      instance.setMessages([
        mockMessage('1', 'Just text'),
        mockMessage('2', pollText),
        mockMessage('3', voteText),
      ]);

      const parsed = instance.parsedMessages;

      expect(parsed).toHaveLength(3);
      expect(parsed[0]).toMatchObject({
        type: 'plain',
        id: '1',
        author: 'User 1',
        text: 'Just text',
      });
      expect(parsed[1]).toMatchObject({
        type: 'poll',
        question: 'Q?',
        options: ['X', 'Y'],
        id: '2',
        author: 'User 2',
      });
      expect(parsed[2]).toMatchObject({
        type: 'vote',
        pollId: 'p1',
        optionIndex: 0,
        id: '3',
        author: 'User 3',
      });
    });
  });
});
