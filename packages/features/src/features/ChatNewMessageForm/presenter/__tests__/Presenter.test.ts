import Presenter from '../Presenter';

import type { TStore } from '../../store';

describe('Presenter', () => {
  let presenter: Presenter;

  const field = {
    getValue: jest.fn(),
    hasValid: jest.fn(),
    setValue: jest.fn(),
  };

  const store = {
    state: {
      getTextMessageField: jest.fn(() => {
        return field;
      }),
      applyToTextMessageField: jest.fn(),
      getPollQuestion: jest.fn(() => {
        return '';
      }),
      getPollOptions: jest.fn(() => {
        return ['', ''];
      }),
      getPollMode: jest.fn((): 'multiple' | 'single' => {
        return 'multiple' as const;
      }),
      getTrimmedPollData: jest.fn(() => {
        return { question: '', options: [] as string[] };
      }),
      canAddPollOption: jest.fn(() => {
        return true;
      }),
      canRemovePollOption: jest.fn(() => {
        return false;
      }),
      setPollQuestion: jest.fn(),
      setPollMode: jest.fn(),
      addPollOption: jest.fn(),
      removePollOption: jest.fn(),
      setPollOption: jest.fn(),
      resetPoll: jest.fn(),
    },
    executableActions: {
      sendMessage: {
        execute: jest.fn(),
      },
      sendPoll: {
        execute: jest.fn(),
        canExecute: jest.fn(),
      },
    },
    destroy: jest.fn(),
  };

  beforeEach(() => {
    presenter = new Presenter({ store: store as unknown as TStore });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('должен создавать props view', () => {
    const props = presenter.getPropsView();

    expect(props.getFields).toBeDefined();
    expect(props.onSendMessage).toBeDefined();
    expect(props.onSendPoll).toBeDefined();
  });

  it('должен создавать fields', () => {
    const fields = presenter.getPropsView().getFields();

    expect(fields.getTextMessageField).toBeDefined();
    expect(fields.applyToTextMessageField).toBeDefined();
    expect(fields.getPollQuestion).toBeDefined();
    expect(fields.getPollOptions).toBeDefined();
    expect(fields.getTrimmedPollData).toBeDefined();
    expect(fields.canAddPollOption).toBeDefined();
    expect(fields.canRemovePollOption).toBeDefined();
    expect(fields.hasDisabledSubmitPoll).toBeDefined();
    expect(fields.setPollQuestion).toBeDefined();
    expect(fields.addPollOption).toBeDefined();
    expect(fields.removePollOption).toBeDefined();
    expect(fields.setPollOption).toBeDefined();
    expect(fields.resetPoll).toBeDefined();
  });

  it('должен вызывать store.executableActions.sendMessage.execute при вызове onSendMessage', () => {
    presenter.getPropsView().onSendMessage();

    expect(store.executableActions.sendMessage.execute).toHaveBeenCalledTimes(1);
  });

  it('должен вызывать store.executableActions.sendPoll.execute при вызове onSendPoll', () => {
    presenter.getPropsView().onSendPoll();

    expect(store.executableActions.sendPoll.execute).toHaveBeenCalledTimes(1);
  });

  describe('getTextMessageField', () => {
    it('должен преобразовать field в props view', () => {
      const { getTextMessageField } = presenter.getPropsView().getFields();

      expect(getTextMessageField()).toHaveProperty('getValue');
      expect(getTextMessageField()).toHaveProperty('getError');
      expect(getTextMessageField()).toHaveProperty('hasValid');
      expect(getTextMessageField()).toHaveProperty('hasDisabled');
      expect(getTextMessageField()).toHaveProperty('onChange');
    });

    it('должен вызывать setValue без изменений значения', () => {
      field.getValue.mockReturnValue('test');

      const fields = presenter.getPropsView().getFields();

      fields.getTextMessageField().onChange('test2');

      expect(field.setValue).toHaveBeenCalledWith('test2');
    });
  });

  describe('poll fields', () => {
    it('должен проксировать applyToTextMessageField в store.state.applyToTextMessageField', () => {
      const fields = presenter.getPropsView().getFields();

      fields.applyToTextMessageField('😮');

      expect(store.state.applyToTextMessageField).toHaveBeenCalledWith('😮');
    });

    it('должен возвращать pollQuestion из store.state.getPollQuestion', () => {
      store.state.getPollQuestion.mockReturnValue('Question?');

      const fields = presenter.getPropsView().getFields();

      const result = fields.getPollQuestion();

      expect(store.state.getPollQuestion).toHaveBeenCalledTimes(1);
      expect(result).toBe('Question?');
    });

    it('должен возвращать pollOptions из store.state.getPollOptions', () => {
      const options = ['A', 'B'];

      store.state.getPollOptions.mockReturnValue(options);

      const fields = presenter.getPropsView().getFields();

      const result = fields.getPollOptions();

      expect(store.state.getPollOptions).toHaveBeenCalledTimes(1);
      expect(result).toBe(options);
    });

    it('должен возвращать pollMode из store.state.getPollMode', () => {
      store.state.getPollMode.mockReturnValue('single' as const);

      const fields = presenter.getPropsView().getFields();

      const result = fields.getPollMode();

      expect(store.state.getPollMode).toHaveBeenCalledTimes(1);
      expect(result).toBe('single');
    });

    it('должен возвращать trimmedPollData из store.state.getTrimmedPollData', () => {
      const trimmedData = { question: 'Q', options: ['A'] as string[] };

      store.state.getTrimmedPollData.mockReturnValue(trimmedData);

      const fields = presenter.getPropsView().getFields();

      const result = fields.getTrimmedPollData();

      expect(store.state.getTrimmedPollData).toHaveBeenCalledTimes(1);
      expect(result).toBe(trimmedData);
    });

    it('должен возвращать canAddPollOption из store.state.canAddPollOption', () => {
      store.state.canAddPollOption.mockReturnValue(true);

      const fields = presenter.getPropsView().getFields();

      const result = fields.canAddPollOption();

      expect(store.state.canAddPollOption).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('должен возвращать canRemovePollOption из store.state.canRemovePollOption', () => {
      store.state.canRemovePollOption.mockReturnValue(true);

      const fields = presenter.getPropsView().getFields();

      const result = fields.canRemovePollOption();

      expect(store.state.canRemovePollOption).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('должен проксировать setPollQuestion в store.state.setPollQuestion', () => {
      const fields = presenter.getPropsView().getFields();

      fields.setPollQuestion('question');

      expect(store.state.setPollQuestion).toHaveBeenCalledWith('question');
    });

    it('должен проксировать setPollMode в store.state.setPollMode', () => {
      const fields = presenter.getPropsView().getFields();

      fields.setPollMode('single');

      expect(store.state.setPollMode).toHaveBeenCalledWith('single');
    });

    it('должен проксировать addPollOption в store.state.addPollOption', () => {
      const fields = presenter.getPropsView().getFields();

      fields.addPollOption();

      expect(store.state.addPollOption).toHaveBeenCalledTimes(1);
    });

    it('должен проксировать removePollOption в store.state.removePollOption', () => {
      const fields = presenter.getPropsView().getFields();

      fields.removePollOption(1);

      expect(store.state.removePollOption).toHaveBeenCalledWith(1);
    });

    it('должен проксировать setPollOption в store.state.setPollOption', () => {
      const fields = presenter.getPropsView().getFields();

      fields.setPollOption(0, 'option');

      expect(store.state.setPollOption).toHaveBeenCalledWith(0, 'option');
    });

    it('должен проксировать resetPoll в store.state.resetPoll', () => {
      const fields = presenter.getPropsView().getFields();

      fields.resetPoll();

      expect(store.state.resetPoll).toHaveBeenCalledTimes(1);
    });

    it('hasDisabledSubmitPoll должен возвращать true, если sendPoll.canExecute возвращает false', () => {
      store.executableActions.sendPoll.canExecute.mockReturnValue(false);

      const fields = presenter.getPropsView().getFields();

      const result = fields.hasDisabledSubmitPoll();

      expect(store.executableActions.sendPoll.canExecute).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('hasDisabledSubmitPoll должен возвращать false, если sendPoll.canExecute возвращает true', () => {
      store.executableActions.sendPoll.canExecute.mockReturnValue(true);

      const fields = presenter.getPropsView().getFields();

      const result = fields.hasDisabledSubmitPoll();

      expect(store.executableActions.sendPoll.canExecute).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
  });
});
