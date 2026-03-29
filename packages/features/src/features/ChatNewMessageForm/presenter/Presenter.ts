import { BasePresenter } from '@experiments/framework';

import type { TPollMode } from '../../../shared/voteEncoding';
import type { TStore } from '../store';
import type { TPropsView } from '../ui';

type TFields = ReturnType<TPropsView['getFields']>;

class Presenter extends BasePresenter<TPropsView, TStore, TFields> {
  public createPropsView = (): TPropsView => {
    return {
      getFields: this.getFields,
      onSendMessage: this.onSendMessage,
      onSendPoll: this.onSendPoll,
    };
  };

  protected createFields = () => {
    return {
      getTextMessageField: this.getTextMessageField,
      applyToTextMessageField: this.store.state.applyToTextMessageField,
      getPollQuestion: () => {
        return this.store.state.getPollQuestion();
      },
      getPollOptions: () => {
        return this.store.state.getPollOptions();
      },
      getPollMode: () => {
        return this.store.state.getPollMode();
      },
      getTrimmedPollData: () => {
        return this.store.state.getTrimmedPollData();
      },
      canAddPollOption: () => {
        return this.store.state.canAddPollOption();
      },
      canRemovePollOption: () => {
        return this.store.state.canRemovePollOption();
      },
      hasDisabledSubmitPoll: () => {
        return this.hasDisabledSubmitPoll();
      },
      setPollQuestion: (value: string) => {
        this.store.state.setPollQuestion(value);
      },
      setPollMode: (mode: TPollMode) => {
        this.store.state.setPollMode(mode);
      },
      addPollOption: () => {
        this.store.state.addPollOption();
      },
      removePollOption: (index: number) => {
        this.store.state.removePollOption(index);
      },
      setPollOption: (index: number, value: string) => {
        this.store.state.setPollOption(index, value);
      },
      resetPoll: () => {
        this.store.state.resetPoll();
      },
    };
  };

  private readonly getTextMessageField = () => {
    return this.parseFormFieldToPropsView(this.store.state.getTextMessageField());
  };

  private readonly onSendMessage = () => {
    this.store.executableActions.sendMessage.execute();
  };

  private readonly onSendPoll = () => {
    this.store.executableActions.sendPoll.execute();
  };

  private readonly hasDisabledSubmitPoll = () => {
    return !this.store.executableActions.sendPoll.canExecute();
  };
}

export default Presenter;
