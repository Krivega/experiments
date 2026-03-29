import PollModel, { MAX_POLL_OPTIONS, getPollOptionOrEmpty } from '../Model';

import type { TPollInstance } from '../Model';

describe('getPollOptionOrEmpty', () => {
  it('возвращает значение по ключу, если оно есть', () => {
    const map = {
      get: (k: string) => {
        return k === '0' ? 'A' : 'B';
      },
    };

    expect(getPollOptionOrEmpty(map, '0')).toBe('A');
    expect(getPollOptionOrEmpty(map, '1')).toBe('B');
  });

  it('возвращает пустую строку, если get вернул undefined', () => {
    const map = {
      get: () => {
        return undefined as string | undefined;
      },
    };

    expect(getPollOptionOrEmpty(map, 'any')).toBe('');
  });
});

describe('Poll Model', () => {
  let instance: TPollInstance;

  beforeEach(() => {
    instance = PollModel.create();
  });

  describe('инициализация', () => {
    it('должен иметь пустой вопрос, два пустых варианта и multiple-режим по умолчанию', () => {
      expect(instance.pollQuestion).toBe('');
      expect(instance.pollOptions).toEqual(['', '']);
      expect(instance.pollMode).toBe('multiple');
    });

    it('currentState возвращает pollQuestion и pollOptions', () => {
      expect(instance.currentState).toEqual({
        pollQuestion: '',
        pollOptions: ['', ''],
        pollMode: 'multiple',
      });
    });
  });

  describe('setPollQuestion / setPollOption', () => {
    it('setPollQuestion обновляет вопрос', () => {
      instance.setPollQuestion('  Question?  ');

      expect(instance.pollQuestion).toBe('  Question?  ');
    });

    it('setPollOption обновляет вариант по индексу', () => {
      instance.setPollOption(0, 'A');
      instance.setPollOption(1, 'B');

      expect(instance.pollOptions).toEqual(['A', 'B']);
    });

    it('setPollOption игнорирует несуществующий индекс', () => {
      instance.setPollOption(5, 'X');

      expect(instance.pollOptions).toEqual(['', '']);
    });
  });

  describe('pollMode / setPollMode', () => {
    it('setPollMode обновляет режим голосования', () => {
      expect(instance.pollMode).toBe('multiple');

      instance.setPollMode('single');

      expect(instance.pollMode).toBe('single');
      expect(instance.isMultipleChoice).toBe(false);
    });
  });

  describe('canAddPollOption / canRemovePollOption', () => {
    it('canAddPollOption: true при количестве вариантов < MAX_POLL_OPTIONS', () => {
      expect(instance.canAddPollOption).toBe(true);

      instance.addPollOption();
      instance.addPollOption();
      instance.addPollOption();

      expect(instance.pollOptions).toHaveLength(MAX_POLL_OPTIONS);
      expect(instance.canAddPollOption).toBe(false);
    });

    it('canRemovePollOption: false при MIN_POLL_OPTIONS, true при большем числе', () => {
      expect(instance.canRemovePollOption).toBe(false);

      instance.addPollOption();

      expect(instance.canRemovePollOption).toBe(true);
    });
  });

  describe('addPollOption', () => {
    it('добавляет пустой вариант до MAX_POLL_OPTIONS', () => {
      instance.addPollOption();

      expect(instance.pollOptions).toEqual(['', '', '']);

      instance.addPollOption();
      instance.addPollOption();

      expect(instance.pollOptions).toHaveLength(MAX_POLL_OPTIONS);
    });

    it('не добавляет вариант при достижении MAX_POLL_OPTIONS', () => {
      for (let i = 0; i < MAX_POLL_OPTIONS + 2; i += 1) {
        instance.addPollOption();
      }

      expect(instance.pollOptions).toHaveLength(MAX_POLL_OPTIONS);
    });
  });

  describe('removePollOption', () => {
    it('не удаляет при количестве вариантов <= MIN_POLL_OPTIONS', () => {
      instance.removePollOption(0);
      instance.removePollOption(1);

      expect(instance.pollOptions).toEqual(['', '']);
    });

    it('удаляет вариант по индексу и перенумеровывает', () => {
      instance.setPollOption(0, 'A');
      instance.setPollOption(1, 'B');
      instance.addPollOption();
      instance.setPollOption(2, 'C');

      instance.removePollOption(1);

      expect(instance.pollOptions).toEqual(['A', 'C']);
    });
  });

  describe('trimmedPollOptions / getTrimmedPollData', () => {
    it('trimmedPollOptions обрезает пробелы и убирает пустые', () => {
      instance.setPollOption(0, '  A  ');
      instance.setPollOption(1, '  ');
      instance.addPollOption();
      instance.setPollOption(2, 'B');

      expect(instance.trimmedPollOptions).toEqual(['A', 'B']);
    });

    it('getTrimmedPollData возвращает trimmed вопрос и варианты', () => {
      instance.setPollQuestion('  Question?  ');
      instance.setPollOption(0, '  A  ');
      instance.setPollOption(1, 'B');

      expect(instance.getTrimmedPollData()).toEqual({
        question: 'Question?',
        options: ['A', 'B'],
      });
    });
  });

  describe('canSubmitPoll', () => {
    it('false при пустом вопросе', () => {
      instance.setPollOption(0, 'A');
      instance.setPollOption(1, 'B');

      expect(instance.canSubmitPoll).toBe(false);
    });

    it('false при недостатке непустых вариантов', () => {
      instance.setPollQuestion('Q?');
      instance.setPollOption(0, 'A');
      instance.setPollOption(1, '  ');

      expect(instance.canSubmitPoll).toBe(false);
    });

    it('true при непустом вопросе и >= MIN_POLL_OPTIONS непустых вариантах', () => {
      instance.setPollQuestion('Q?');
      instance.setPollOption(0, 'A');
      instance.setPollOption(1, 'B');

      expect(instance.canSubmitPoll).toBe(true);
    });
  });

  describe('pollToMessage', () => {
    const fixedUuid = 'aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee';

    beforeEach(() => {
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(fixedUuid);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('возвращает строку с [POLL] и JSON при валидном опросе', () => {
      instance.setPollQuestion('Question?');
      instance.setPollOption(0, 'A');
      instance.setPollOption(1, 'B');

      const result = instance.pollToMessage();

      expect(result).toBeDefined();
      expect(result).toContain('[POLL]');
      expect(result).toContain(fixedUuid);
      expect(result).toContain('Question?');
      expect(result).toContain('A');
      expect(result).toContain('B');
    });
  });

  describe('resetPoll', () => {
    it('сбрасывает вопрос, варианты и режим к начальному состоянию', () => {
      instance.setPollQuestion('Q?');
      instance.setPollOption(0, 'A');
      instance.setPollOption(1, 'B');
      instance.addPollOption();
      instance.setPollMode('single');

      instance.resetPoll();

      expect(instance.pollQuestion).toBe('');
      expect(instance.pollOptions).toEqual(['', '']);
      expect(instance.pollMode).toBe('multiple');
    });
  });
});
