import type { TParsedPlain, TParsedPoll, TParsedVote, TPollMode } from '@/shared/voteEncoding';

export type TFeedItemMessage = {
  type: 'message';
  id: string;
  author: string;
  text: string;
  timestamp: number;
  isDeletable: boolean;
};

export type TFeedItemPoll = {
  type: 'poll';
  messageId: string;
  author: string;
  timestamp: number;
  isDeletable: boolean;
  pollId: string;
  question: string;
  options: string[];
  mode: TPollMode;
  votesByOptionIndex: Record<number, string[]>;
};

export type TFeedItem = TFeedItemMessage | TFeedItemPoll;

export type TMessageMeta = {
  id: string;
  timestamp: number;
  isDeletable: boolean;
  isRead: boolean;
  isMy: boolean;
  author: string;
};

export type TParsedPolWithMeta = TParsedPoll & TMessageMeta;
export type TParsedVoteWithMeta = TParsedVote & TMessageMeta;

export type TParsedMessageWithMeta =
  | (TParsedPlain & TMessageMeta & { text: string })
  | TParsedPolWithMeta
  | TParsedVoteWithMeta;

export type TVotesAggregate = Record<string, Record<number, string[]> | undefined>;
