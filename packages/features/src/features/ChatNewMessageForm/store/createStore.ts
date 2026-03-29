import { Store } from '@experiments/framework';

import { Model } from './@Model';
import { SendMessage, SendPoll } from './actions';

import type { TPollMode } from '@/shared/voteEncoding';
import type { TInstance } from './@Model';
import type { TActionParams, TDependencies } from './types';

const createStore = (dependencies: TDependencies) => {
  const store = new Store(
    () => {
      return Model.create();
    },
    {
      dependencies,
      reactions: [],
      executableActionFactories: {
        sendMessage: (params: TActionParams) => {
          return new SendMessage(params);
        },
        sendPoll: (params: TActionParams) => {
          return new SendPoll(params);
        },
      },
      instanceToPublicAPI: (instance: TInstance) => {
        return {
          getTextMessageField: () => {
            return instance.fields.textMessageField;
          },
          applyToTextMessageField: (value: string) => {
            instance.fields.applyToTextMessageField(value);
          },
          getPollQuestion: () => {
            return instance.fields.pollQuestion;
          },
          getPollOptions: () => {
            return instance.fields.pollOptions;
          },
          getPollMode: () => {
            return instance.fields.pollMode;
          },
          canAddPollOption: () => {
            return instance.fields.canAddPollOption;
          },
          canRemovePollOption: () => {
            return instance.fields.canRemovePollOption;
          },
          getTrimmedPollData: () => {
            return instance.fields.getTrimmedPollData();
          },
          setPollQuestion: (value: string) => {
            instance.fields.setPollQuestion(value);
          },
          setPollMode: (mode: TPollMode) => {
            instance.fields.setPollMode(mode);
          },
          addPollOption: () => {
            instance.fields.addPollOption();
          },
          removePollOption: (index: number) => {
            instance.fields.removePollOption(index);
          },
          setPollOption: (index: number, value: string) => {
            instance.fields.setPollOption(index, value);
          },
          resetPoll: () => {
            instance.fields.resetPoll();
          },
        };
      },
    },
  );

  return store.getPublicAPI();
};

export type TStore = ReturnType<typeof createStore>;

export default createStore;
