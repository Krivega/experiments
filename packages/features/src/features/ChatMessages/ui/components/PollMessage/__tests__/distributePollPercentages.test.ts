/// <reference types="jest" />
import distributePollPercentages from '../distributePollPercentages';

const sum = (values: number[]): number => {
  return values.reduce((accumulator, value) => {
    return accumulator + value;
  }, 0);
};

describe('distributePollPercentages', () => {
  describe('при totalVotes <= 0', () => {
    it('возвращает нули той же длины', () => {
      expect(distributePollPercentages([1, 2, 3], 0)).toEqual([0, 0, 0]);
      expect(distributePollPercentages([5], -1)).toEqual([0]);
    });
  });

  describe('без tieBreakPollId (startIndex = 0)', () => {
    it('[1, 7] при total 8 — 13 и 87', () => {
      expect(distributePollPercentages([1, 7], 8)).toEqual([13, 87]);
    });

    it('[4, 1, 1] при total 6 — 67, 17, 16', () => {
      expect(distributePollPercentages([4, 1, 1], 6)).toEqual([67, 17, 16]);
    });

    it('[1, 1, 1] при total 3 — один 34 и два 33', () => {
      expect(distributePollPercentages([1, 1, 1], 3)).toEqual([34, 33, 33]);
    });

    it('[3, 1, 1, 1] при total 6', () => {
      expect(distributePollPercentages([3, 1, 1, 1], 6)).toEqual([50, 17, 17, 16]);
    });

    it('[5, 1, 1, 1] при total 8', () => {
      expect(distributePollPercentages([5, 1, 1, 1], 8)).toEqual([63, 13, 12, 12]);
    });

    it('[3, 2, 2, 2] при total 9', () => {
      expect(distributePollPercentages([3, 2, 2, 2], 9)).toEqual([34, 22, 22, 22]);
    });

    it('[3, 1, 1, 1, 0] при total 6', () => {
      expect(distributePollPercentages([3, 1, 1, 1, 0], 6)).toEqual([50, 17, 17, 16, 0]);
    });

    it('[4, 1, 1, 1, 1] при total 8 — у 4 голосов остаток 0, +1 у единиц с большим remainder', () => {
      expect(distributePollPercentages([4, 1, 1, 1, 1], 8)).toEqual([50, 13, 13, 12, 12]);
    });

    it('[3, 2, 2, 1, 1] при total 9', () => {
      expect(distributePollPercentages([3, 2, 2, 1, 1], 9)).toEqual([34, 22, 22, 11, 11]);
    });
  });

  describe('инварианты', () => {
    it('сумма всегда 100 при totalVotes > 0', () => {
      const cases: [number[], number][] = [
        [[1, 1], 2],
        [[2, 2, 2], 6],
        [[1, 2, 3, 4], 10],
        [[0, 0, 5], 5],
        [[1, 1, 1, 1, 1], 5],
      ];

      cases.forEach(([counts, total]) => {
        expect(sum(distributePollPercentages(counts, total))).toBe(100);
      });
    });

    it('при одинаковом pollId результат стабилен', () => {
      const first = distributePollPercentages([1, 1, 1], 3, 'poll-stable-id');
      const second = distributePollPercentages([1, 1, 1], 3, 'poll-stable-id');

      expect(first).toEqual(second);
    });

    it('при [1,1,1] и pollId сумма 100 и ровно один вариант на 34%', () => {
      const result = distributePollPercentages([1, 1, 1], 3, 'any-poll-id');

      expect(sum(result)).toBe(100);
      expect(
        result.filter((value) => {
          return value === 34;
        }).length,
      ).toBe(1);
      expect(
        result.filter((value) => {
          return value === 33;
        }).length,
      ).toBe(2);
    });
  });
});
