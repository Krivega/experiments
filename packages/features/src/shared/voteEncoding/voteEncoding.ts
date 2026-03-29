export const POLL_PREFIX = '[POLL]';
export const VOTE_PREFIX = '[VOTE]';

export type TPollMode = 'single' | 'multiple';

export type TParsedPlain = { type: 'plain' };
export type TParsedPoll = {
  type: 'poll';
  pollId: string;
  question: string;
  options: string[];
  mode: TPollMode;
};
export type TParsedVote = {
  type: 'vote';
  pollId: string;
  optionIndex: number;
};
export type TParsedMessage = TParsedPlain | TParsedPoll | TParsedVote;

type TPollPayload = {
  pollId: string;
  question: string;
  options: string[];
  mode: TPollMode;
};
type TVotePayload = {
  pollId: string;
  optionIndex: number;
};

export type TEncodePollParams = {
  pollId: string;
  question: string;
  options: string[];
  mode: TPollMode;
};

export type TEncodeVoteParams = {
  pollId: string;
  optionIndex: number;
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const safeParseJson = <T>(raw: string): T | undefined => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
};

export const parseMessageText = (text: string): TParsedMessage => {
  if (typeof text !== 'string') {
    return { type: 'plain' };
  }

  const trimmed = text.trim();

  if (trimmed.startsWith(POLL_PREFIX)) {
    const raw = trimmed.slice(POLL_PREFIX.length).trim();
    const payload = safeParseJson<TPollPayload>(raw);

    if (
      payload &&
      typeof payload.pollId === 'string' &&
      typeof payload.question === 'string' &&
      Array.isArray(payload.options) &&
      payload.options.every((o) => {
        return typeof o === 'string';
      })
    ) {
      const mode: TPollMode = payload.mode === 'single' ? 'single' : 'multiple';

      return {
        type: 'poll',
        pollId: payload.pollId,
        question: payload.question,
        options: payload.options,
        mode,
      };
    }
  }

  if (trimmed.startsWith(VOTE_PREFIX)) {
    const raw = trimmed.slice(VOTE_PREFIX.length).trim();
    const payload = safeParseJson<TVotePayload>(raw);

    if (
      payload &&
      typeof payload.pollId === 'string' &&
      typeof payload.optionIndex === 'number' &&
      Number.isInteger(payload.optionIndex) &&
      payload.optionIndex >= 0
    ) {
      return {
        type: 'vote',
        pollId: payload.pollId,
        optionIndex: payload.optionIndex,
      };
    }
  }

  return { type: 'plain' };
};

export const encodePoll = ({ pollId, question, options, mode }: TEncodePollParams): string => {
  const payload: TPollPayload = { pollId, question, options, mode };

  return `${POLL_PREFIX}${JSON.stringify(payload)}`;
};

export const encodeVote = ({ pollId, optionIndex }: TEncodeVoteParams): string => {
  const payload: TVotePayload = { pollId, optionIndex };

  return `${VOTE_PREFIX}${JSON.stringify(payload)}`;
};
