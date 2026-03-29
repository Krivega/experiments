/* eslint-disable no-underscore-dangle */
import { resolveSetter } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';

import { encodePoll } from '../../../../../../shared/voteEncoding';

import type { TInstanceModel } from '@experiments/mst-tools';
import type { TPollState } from './types';
import type { TPollMode } from '../../../../../../shared/voteEncoding';

export const MIN_POLL_OPTIONS = 2;
export const MAX_POLL_OPTIONS = 5;
const INITIAL_POLL_OPTIONS_MAP = { 0: '', 1: '' };

const DEFAULT_POLL_MODE: TPollMode = 'multiple';

type TPollOptionsMapLike = {
  keys: () => IterableIterator<string>;
  get: (key: string) => string | undefined;
};

export type TGetPollOptionLike = Pick<TPollOptionsMapLike, 'get'>;

export const getPollOptionOrEmpty = (map: TGetPollOptionLike, key: string): string => {
  return map.get(key) ?? '';
};

const getOrderedPollOptionsArray = (map: TPollOptionsMapLike): string[] => {
  const keys = [...map.keys()].sort((a, b) => {
    return Number(a) - Number(b);
  });

  return keys.map((k) => {
    return getPollOptionOrEmpty(map, k);
  });
};

const PollModel = typesMST
  .model({
    _pollQuestion: typesMST.optional(typesMST.string, ''),
    _pollOptions: typesMST.optional(typesMST.map(typesMST.string), INITIAL_POLL_OPTIONS_MAP),
    _pollMode: typesMST.optional(
      typesMST.enumeration<TPollMode>('PollMode', ['single', 'multiple']),
      DEFAULT_POLL_MODE,
    ),
  })
  .views((self) => {
    return {
      get pollQuestion() {
        return self._pollQuestion;
      },
      get pollOptions() {
        return getOrderedPollOptionsArray(self._pollOptions);
      },
      get pollMode(): TPollMode {
        return self._pollMode;
      },
      get isMultipleChoice(): boolean {
        return self._pollMode === 'multiple';
      },
      get canAddPollOption() {
        return self._pollOptions.size < MAX_POLL_OPTIONS;
      },
      get canRemovePollOption() {
        return self._pollOptions.size > MIN_POLL_OPTIONS;
      },
      get trimmedPollOptions() {
        return this.pollOptions
          .map((o) => {
            return o.trim();
          })
          .filter(Boolean);
      },
      get canSubmitPoll() {
        const question = self._pollQuestion.trim();

        return question.length > 0 && this.trimmedPollOptions.length >= MIN_POLL_OPTIONS;
      },
      getTrimmedPollData() {
        return {
          question: self._pollQuestion.trim(),
          options: this.trimmedPollOptions,
        };
      },
      get currentState(): TPollState {
        return {
          pollQuestion: self._pollQuestion,
          pollOptions: getOrderedPollOptionsArray(self._pollOptions),
          pollMode: self._pollMode,
        };
      },

      pollToMessage(): string {
        const { question, options } = this.getTrimmedPollData();
        const pollId = crypto.randomUUID();

        return encodePoll({ pollId, question, options, mode: self._pollMode });
      },
    };
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setPollQuestion = resolveSelfSetter('_pollQuestion');
    const setPollMode = resolveSelfSetter('_pollMode');

    const addPollOption = () => {
      if (self._pollOptions.size < MAX_POLL_OPTIONS) {
        self._pollOptions.set(String(self._pollOptions.size), '');
      }
    };

    const removePollOption = (index: number) => {
      if (self._pollOptions.size <= MIN_POLL_OPTIONS) {
        return;
      }

      const keys = [...self._pollOptions.keys()].sort((a, b) => {
        return Number(a) - Number(b);
      });
      const nextMap: Record<string, string> = {};

      keys.forEach((key, i) => {
        if (i !== index) {
          const newKey = String(Object.keys(nextMap).length);

          nextMap[newKey] = getPollOptionOrEmpty(self._pollOptions, key);
        }
      });
      self._pollOptions.replace(nextMap);
    };

    const setPollOption = (index: number, value: string) => {
      const key = String(index);

      if (self._pollOptions.has(key)) {
        self._pollOptions.set(key, value);
      }
    };

    const resetPoll = () => {
      setPollQuestion('');
      self._pollOptions.replace(INITIAL_POLL_OPTIONS_MAP);
      setPollMode(DEFAULT_POLL_MODE);
    };

    return {
      setPollQuestion,
      addPollOption,
      removePollOption,
      setPollOption,
      setPollMode,
      resetPoll,
    };
  });

export type TPollInstance = TInstanceModel<typeof PollModel>;
export default PollModel;
