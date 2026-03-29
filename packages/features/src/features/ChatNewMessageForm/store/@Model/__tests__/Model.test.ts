import { destroy } from 'mobx-state-tree';

import { unsubscribeMocked } from '@/shared/__tests-utils__';
import Model from '../Model';

import type { TInstance } from '../Model';

describe('Model', () => {
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();
  });

  it('инициализация', () => {
    expect(instance.fields.currentState).toEqual({
      textMessage: '',
    });
  });

  it('должен быть синхронизирован с rememberedState', () => {
    expect(instance.fields.rememberedState).toEqual({
      textMessage: '',
    });
    expect(instance.fields.hasEqualState()).toBe(true);
  });

  it('должен отписываться от FormValidator при уничтожении', () => {
    // под капотом FormValidator, при вызове subscribe, предварительно, вызывается unsubscribe
    jest.clearAllMocks();

    destroy(instance);

    expect(unsubscribeMocked).toHaveBeenCalledTimes(1);
  });

  it('canSave: должен возвращать true, когда fields.hasValid возвращает true', () => {
    expect(instance.canSave()).toBe(false);

    instance.fields.textMessageField.setValue('');

    expect(instance.canSave()).toBe(false);

    instance.fields.textMessageField.setValue('message');

    expect(instance.canSave()).toBe(true);
  });

  it('reset: должен сбросить значения полей на значения из rememberState', () => {
    instance.fields.textMessageField.setValue('message');

    expect(instance.fields.textMessageField.getValue()).toBe('message');

    instance.reset();

    expect(instance.fields.textMessageField.getValue()).toBe('');
  });

  describe('applyToTextMessageField', () => {
    it('должен добавлять переданное значение к текущему тексту сообщения', () => {
      instance.fields.textMessageField.setValue('hello');

      instance.fields.applyToTextMessageField('New');

      expect(instance.fields.textMessageField.getValue()).toBe('helloNew');
    });

    it('должен добавлять переданное значение к пустому тексту сообщения', () => {
      expect(instance.fields.textMessageField.getValue()).toBe('');

      instance.fields.applyToTextMessageField('Some');

      expect(instance.fields.textMessageField.getValue()).toBe('Some');
    });
  });

  describe('poll methods', () => {
    it('pollQuestion / setPollQuestion: делегируют в poll', () => {
      expect(instance.fields.pollQuestion).toBe('');

      instance.fields.setPollQuestion('  Question?  ');

      expect(instance.fields.pollQuestion).toBe('  Question?  ');
    });

    it('pollOptions / setPollOption: делегируют в poll', () => {
      expect(instance.fields.pollOptions).toEqual(['', '']);

      instance.fields.setPollOption(0, 'A');
      instance.fields.setPollOption(1, 'B');

      expect(instance.fields.pollOptions).toEqual(['A', 'B']);
    });

    it('pollMode / setPollMode: делегируют в poll', () => {
      expect(instance.fields.pollMode).toBe('multiple');

      instance.fields.setPollMode('single');

      expect(instance.fields.pollMode).toBe('single');
    });

    it('canAddPollOption / addPollOption: делегируют в poll', () => {
      expect(instance.fields.canAddPollOption).toBe(true);

      instance.fields.addPollOption();

      expect(instance.fields.pollOptions).toEqual(['', '', '']);
      expect(instance.fields.canAddPollOption).toBe(true);

      instance.fields.addPollOption();
      instance.fields.addPollOption();

      expect(instance.fields.pollOptions).toHaveLength(5);
      expect(instance.fields.canAddPollOption).toBe(false);
    });

    it('canRemovePollOption / removePollOption: делегируют в poll', () => {
      expect(instance.fields.canRemovePollOption).toBe(false);

      instance.fields.addPollOption();

      expect(instance.fields.canRemovePollOption).toBe(true);

      instance.fields.setPollOption(0, 'A');
      instance.fields.setPollOption(1, 'B');
      instance.fields.setPollOption(2, 'C');
      instance.fields.removePollOption(1);

      expect(instance.fields.pollOptions).toEqual(['A', 'C']);
    });

    it('trimmedPollOptions / getTrimmedPollData: делегируют в poll', () => {
      instance.fields.setPollQuestion('  Q?  ');
      instance.fields.setPollOption(0, '  A  ');
      instance.fields.setPollOption(1, 'B');

      expect(instance.fields.trimmedPollOptions).toEqual(['A', 'B']);
      expect(instance.fields.getTrimmedPollData()).toEqual({
        question: 'Q?',
        options: ['A', 'B'],
      });
    });

    it('canSubmitPoll: делегирует в poll', () => {
      expect(instance.fields.canSubmitPoll).toBe(false);

      instance.fields.setPollQuestion('Q?');
      instance.fields.setPollOption(0, 'A');
      instance.fields.setPollOption(1, 'B');

      expect(instance.fields.canSubmitPoll).toBe(true);
    });

    it('pollToMessage: делегирует в poll', () => {
      instance.fields.setPollQuestion('Question?');
      instance.fields.setPollOption(0, 'A');
      instance.fields.setPollOption(1, 'B');

      const message = instance.fields.pollToMessage();

      expect(message).toBeDefined();
      expect(message).toContain('[POLL]');
      expect(message).toContain('Question?');
      expect(message).toContain('A');
      expect(message).toContain('B');
    });

    it('resetPoll: делегирует в poll и сбрасывает опрос', () => {
      instance.fields.setPollQuestion('Q?');
      instance.fields.setPollOption(0, 'A');
      instance.fields.setPollOption(1, 'B');
      instance.fields.addPollOption();
      instance.fields.setPollMode('single');

      instance.fields.resetPoll();

      expect(instance.fields.pollQuestion).toBe('');
      expect(instance.fields.pollOptions).toEqual(['', '']);
      expect(instance.fields.pollMode).toBe('multiple');
    });
  });
});
