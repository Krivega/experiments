import type { TPollMode } from '@/shared/voteEncoding';

export type TMessage = {
  id: string;
  text: string;
  timestamp: number;
  author: string;
  isDeletable: boolean;
};

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
