/* eslint-disable no-underscore-dangle */
import { viewTransform } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';

import { MessageModel } from './Message';
import { encodeVote } from '../../../../shared/voteEncoding';

import type { TInstanceModel } from '@experiments/mst-tools';
import type { TInstanceMessage, TInitialStateMessage } from './Message';
import type {
  TFeedItem,
  TVotesAggregate,
  TParsedMessageWithMeta,
  TParsedVoteWithMeta,
  TParsedPolWithMeta,
} from './types';

const Model = typesMST
  .model({
    _messages: typesMST.map(MessageModel),
  })
  .views((self) => {
    const transformMessages = viewTransform((messages: (typeof self)['_messages']) => {
      return [...messages.values()];
    });

    return {
      get messages() {
        return transformMessages(self._messages);
      },

      get readMessagesInstances(): TInstanceMessage[] {
        return this.messages.filter((message) => {
          return message.isRead;
        });
      },

      get unreadMessages() {
        return this.parsedMessages.filter((message) => {
          return !message.isRead;
        });
      },

      get unreadMessagesInstances(): TInstanceMessage[] {
        return this.messages.filter((message) => {
          return !message.isRead;
        });
      },

      get countUnreadMessages(): number {
        return this.unreadMessages.length;
      },

      get isUnreadMessages(): boolean {
        return this.countUnreadMessages > 0;
      },

      voteToMessage(pollId: string, optionIndex: number): string {
        return encodeVote({ pollId, optionIndex });
      },

      get votes(): TParsedVoteWithMeta[] {
        return this.parsedMessages.filter((parsedMessage): parsedMessage is TParsedVoteWithMeta => {
          return parsedMessage.type === 'vote';
        });
      },

      myVotesForPoll(pollId: string): TParsedVoteWithMeta[] {
        return this.votes.filter((vote) => {
          return vote.pollId === pollId && vote.isMy;
        });
      },

      hasMyVoteForPoll(pollId: string): boolean {
        return this.myVotesForPoll(pollId).length > 0;
      },

      hasMyVoteForOption(pollId: string, optionIndex: number): boolean {
        return this.myVotesForPoll(pollId).some((vote) => {
          return vote.optionIndex === optionIndex;
        });
      },

      hasMultipleChoicePoll(pollId: string): boolean {
        const poll = this.parsedMessages.find(
          (parsedMessage): parsedMessage is TParsedPolWithMeta => {
            return parsedMessage.type === 'poll' && parsedMessage.pollId === pollId;
          },
        );

        if (!poll) {
          return true;
        }

        return poll.mode === 'multiple';
      },

      get parsedMessages(): TParsedMessageWithMeta[] {
        return this.messages.map((message) => {
          return message.parsedMessage;
        });
      },

      get votesByPollId(): TVotesAggregate {
        const aggregate: TVotesAggregate = {};

        this.votes.forEach((item) => {
          const { pollId, optionIndex, author } = item;

          aggregate[pollId] ??= {};

          const byPoll = aggregate[pollId];

          byPoll[optionIndex] ??= [];

          byPoll[optionIndex].push(author);
        });

        return aggregate;
      },

      get feedItems(): TFeedItem[] {
        const { parsedMessages, votesByPollId } = this;

        const result: TFeedItem[] = [];

        parsedMessages.forEach((item) => {
          if (item.type === 'plain') {
            result.push({
              type: 'message',
              id: item.id,
              timestamp: item.timestamp,
              isDeletable: item.isDeletable,
              author: item.author,
              text: item.text,
            });

            return;
          }

          if (item.type === 'poll') {
            const votes = votesByPollId[item.pollId];

            result.push({
              type: 'poll',
              messageId: item.id,
              author: item.author,
              timestamp: item.timestamp,
              isDeletable: item.isDeletable,
              pollId: item.pollId,
              question: item.question,
              options: item.options,
              mode: item.mode,
              votesByOptionIndex: votes ?? [],
            });
          }
        });

        return result;
      },
    };
  })
  .actions((self) => {
    const markOneMessageAsRead = (message: TInstanceMessage) => {
      message.markAsRead();
    };

    const markAllAsRead = () => {
      self.unreadMessagesInstances.forEach(markOneMessageAsRead);
    };

    const markOneMessageAsReadById = (messageId: string) => {
      const foundMessage = self._messages.get(messageId);

      if (foundMessage) {
        markOneMessageAsRead(foundMessage);
      }
    };

    const markAsReadMessages = (readMessagesIds: string[]) => {
      readMessagesIds.forEach(markOneMessageAsReadById);
    };

    const addOneMessage = (message: TInitialStateMessage) => {
      const oldMessage = self._messages.get(message.id);
      const isReadOldMessage = oldMessage?.isRead ?? false;

      self._messages.set(message.id, message);

      if (isReadOldMessage) {
        markOneMessageAsReadById(message.id);
      }
    };

    const addMessages = (messages: TInitialStateMessage[]) => {
      messages.forEach(addOneMessage);
    };

    const hasReplaceableMessages = (messages: TInitialStateMessage[]) => {
      if (self._messages.size !== messages.length) {
        return true;
      }

      return messages.some((message) => {
        return !self._messages.has(message.id);
      });
    };

    const clearMessages = () => {
      self._messages.clear();
    };

    const setMessages = (messages: TInitialStateMessage[]) => {
      const readMessagesIds = self.readMessagesInstances.map(({ id }) => {
        return id;
      });

      if (hasReplaceableMessages(messages)) {
        clearMessages();
      }

      addMessages(messages);
      markAsReadMessages(readMessagesIds);
    };

    return {
      markAllAsRead,
      clearMessages,
      setMessages,
    };
  });

export type TInstance = TInstanceModel<typeof Model>;

export default Model;
