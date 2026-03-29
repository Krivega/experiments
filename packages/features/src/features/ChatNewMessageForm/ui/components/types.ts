import type { TFormFieldView } from '@experiments/framework';
import type { TPollMode } from '../../../../shared/voteEncoding';

export type TPollFields = {
  getPollQuestion: () => string;
  getPollOptions: () => string[];
  getPollMode: () => TPollMode;
  getTrimmedPollData: () => { question: string; options: string[] };
  canAddPollOption: () => boolean;
  canRemovePollOption: () => boolean;
  hasDisabledSubmitPoll: () => boolean;
  setPollQuestion: (value: string) => void;
  setPollMode: (mode: TPollMode) => void;
  addPollOption: () => void;
  removePollOption: (index: number) => void;
  setPollOption: (index: number, value: string) => void;
  resetPoll: () => void;
};

export type TFields = {
  getTextMessageField: () => TFormFieldView<string, unknown>;
  applyToTextMessageField: (value: string) => void;
} & TPollFields;
