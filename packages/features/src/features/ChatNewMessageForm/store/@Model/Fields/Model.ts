/* eslint-disable no-underscore-dangle */
import { createFormField, FormValidator, withRememberState } from '@experiments/framework';
import { types as typesMST } from 'mobx-state-tree';

import { PollModel } from './Poll';
import { validateIsRequired } from '../../../../../shared/validationRules';

import type { TInstanceModel } from '@experiments/mst-tools';
import type { TFieldsState } from './types';
import type { TPollMode } from '../../../../../shared/voteEncoding';

const BaseModel = typesMST
  .model({
    _textMessage: createFormField(typesMST.string, {
      initialValue: '',
    }),
    poll: typesMST.optional(PollModel, {}),
  })
  .views((self) => {
    return {
      get textMessageField() {
        return self._textMessage.getField();
      },
      get pollQuestion() {
        return self.poll.pollQuestion;
      },
      get pollOptions() {
        return self.poll.pollOptions;
      },
      get pollMode(): TPollMode {
        return self.poll.pollMode;
      },
      get canAddPollOption() {
        return self.poll.canAddPollOption;
      },
      get canRemovePollOption() {
        return self.poll.canRemovePollOption;
      },
      get trimmedPollOptions() {
        return self.poll.trimmedPollOptions;
      },
      get canSubmitPoll() {
        return self.poll.canSubmitPoll;
      },
      getTrimmedPollData() {
        return self.poll.getTrimmedPollData();
      },
      pollToMessage() {
        return self.poll.pollToMessage();
      },
    };
  })
  .views((self) => {
    return {
      hasValid() {
        return self.textMessageField.hasValid();
      },
    };
  })
  .views((self) => {
    return {
      get currentState(): TFieldsState {
        return {
          textMessage: self.textMessageField.getValue(),
        };
      },
    };
  })
  .actions((self) => {
    const setCurrentState = (state: TFieldsState) => {
      self.textMessageField.setValue(state.textMessage);
    };

    return {
      setCurrentState,
      applyToTextMessageField: (value: string) => {
        const currentValue = self.textMessageField.getValue();

        self.textMessageField.setValue(`${currentValue}${value}`);
      },
      setPollQuestion: (value: string) => {
        self.poll.setPollQuestion(value);
      },
      setPollMode: (mode: TPollMode) => {
        self.poll.setPollMode(mode);
      },
      addPollOption: () => {
        self.poll.addPollOption();
      },
      removePollOption: (index: number) => {
        self.poll.removePollOption(index);
      },
      setPollOption: (index: number, value: string) => {
        self.poll.setPollOption(index, value);
      },
      resetPoll: () => {
        self.poll.resetPoll();
      },
    };
  })
  .actions((self) => {
    const formValidator = new FormValidator({
      textMessage: {
        getRules: () => {
          return [validateIsRequired];
        },
        actions: {
          onError: self._textMessage.setClientError,
          onValid: self._textMessage.resetError,
        },
      },
    });

    const afterCreate = () => {
      formValidator.subscribe({
        getStateDependence: () => {
          return {
            textMessage: self._textMessage.value,
          };
        },
      });
    };

    const beforeDestroy = () => {
      formValidator.unsubscribe();
    };

    return {
      afterCreate,
      beforeDestroy,
    };
  });

const Model = withRememberState(BaseModel);

export type TInstance = TInstanceModel<typeof Model>;

export default Model;
