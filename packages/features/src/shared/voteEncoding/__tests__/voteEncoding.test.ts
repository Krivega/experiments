import {
  parseMessageText,
  encodePoll,
  encodeVote,
  POLL_PREFIX,
  VOTE_PREFIX,
} from '../voteEncoding';

describe('voteEncoding', () => {
  describe('parseMessageText', () => {
    it('должен возвращать plain для обычного текста', () => {
      expect(parseMessageText('Hello')).toEqual({ type: 'plain' });
      expect(parseMessageText('')).toEqual({ type: 'plain' });
      expect(parseMessageText('[POLL]')).toEqual({ type: 'plain' });
      expect(parseMessageText('[VOTE]')).toEqual({ type: 'plain' });
    });

    it('должен возвращать plain для невалидного JSON после префикса', () => {
      expect(parseMessageText(`${POLL_PREFIX}not json`)).toEqual({ type: 'plain' });
      expect(parseMessageText(`${POLL_PREFIX}{`)).toEqual({ type: 'plain' });
      expect(parseMessageText(`${VOTE_PREFIX}{}`)).toEqual({ type: 'plain' });
    });

    it('должен парсить сообщение-опрос без mode как multiple', () => {
      const text = '[POLL]{"pollId":"id-1","question":"Q?","options":["A","B"]}';

      expect(parseMessageText(text)).toEqual({
        type: 'poll',
        pollId: 'id-1',
        question: 'Q?',
        options: ['A', 'B'],
        mode: 'multiple',
      });
    });

    it('должен парсить опрос с пробелами вокруг и без mode как multiple', () => {
      const text = '  [POLL] {"pollId":"x","question":"Q","options":["O"]}  ';

      expect(parseMessageText(text)).toEqual({
        type: 'poll',
        pollId: 'x',
        question: 'Q',
        options: ['O'],
        mode: 'multiple',
      });
    });

    it("должен парсить опрос с mode 'single'", () => {
      const text =
        '[POLL]{"pollId":"id-single","question":"Q?","options":["A","B"],"mode":"single"}';

      expect(parseMessageText(text)).toEqual({
        type: 'poll',
        pollId: 'id-single',
        question: 'Q?',
        options: ['A', 'B'],
        mode: 'single',
      });
    });

    it('должен возвращать plain если в опросе нет pollId/question/options', () => {
      expect(parseMessageText(`${POLL_PREFIX}{}`)).toEqual({ type: 'plain' });
      expect(parseMessageText(`${POLL_PREFIX}{"pollId":"x"}`)).toEqual({ type: 'plain' });
      expect(parseMessageText(`${POLL_PREFIX}{"options":[]}`)).toEqual({ type: 'plain' });
    });

    it('должен парсить сообщение-голос', () => {
      const text = '[VOTE]{"pollId":"id-1","optionIndex":0}';

      expect(parseMessageText(text)).toEqual({
        type: 'vote',
        pollId: 'id-1',
        optionIndex: 0,
      });
    });

    it('должен парсить голос с optionIndex 1', () => {
      const text = '[VOTE]{"pollId":"p","optionIndex":1}';

      expect(parseMessageText(text)).toEqual({
        type: 'vote',
        pollId: 'p',
        optionIndex: 1,
      });
    });

    it('должен возвращать plain для голоса с отрицательным optionIndex', () => {
      expect(parseMessageText('[VOTE]{"pollId":"p","optionIndex":-1}')).toEqual({
        type: 'plain',
      });
    });

    it('должен возвращать plain для не-строки', () => {
      // eslint-disable-next-line unicorn/no-null
      expect(parseMessageText(null as unknown as string)).toEqual({ type: 'plain' });
      expect(parseMessageText(undefined as unknown as string)).toEqual({ type: 'plain' });
    });
  });

  describe('encodePoll', () => {
    it('должен кодировать опрос', () => {
      const s = encodePoll({
        pollId: 'pid',
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });

      expect(s).toContain(POLL_PREFIX);
      expect(parseMessageText(s)).toEqual({
        type: 'poll',
        pollId: 'pid',
        question: 'Question?',
        options: ['A', 'B'],
        mode: 'multiple',
      });
    });
  });

  describe('encodeVote', () => {
    it('должен кодировать голос', () => {
      const s = encodeVote({ pollId: 'pid', optionIndex: 0 });

      expect(s).toContain(VOTE_PREFIX);
      expect(parseMessageText(s)).toEqual({
        type: 'vote',
        pollId: 'pid',
        optionIndex: 0,
      });
    });
  });
});
