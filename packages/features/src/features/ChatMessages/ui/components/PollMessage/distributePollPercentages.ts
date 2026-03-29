const STRING_HASH_MULTIPLIER = 31;

const hashPollIdToTieBreakStart = (pollId: string, length: number): number => {
  if (length <= 0) {
    return 0;
  }

  let hash = 0;

  for (let i = 0; i < pollId.length; i++) {
    const codePoint = pollId.codePointAt(i) ?? 0;

    hash = Math.imul(hash, STRING_HASH_MULTIPLIER) + codePoint;
  }

  return Math.abs(hash) % length;
};

const cyclicRank = (index: number, startIndex: number, length: number): number => {
  return (index - startIndex + length) % length;
};

/**
 * Целые проценты по вариантам так, что их сумма всегда 100 (метод наибольших остатков).
 * При равных остатках от деления порядок задаётся циклически от `tieBreakPollId`, чтобы
 * «лишний» процент не всегда уходил к варианту с индексом 0.
 */
const distributePollPercentages = (
  voteCounts: number[],
  totalVotes: number,
  tieBreakPollId?: string,
): number[] => {
  if (totalVotes <= 0) {
    return voteCounts.map(() => {
      return 0;
    });
  }

  const { length } = voteCounts;
  const startIndex =
    tieBreakPollId === undefined ? 0 : hashPollIdToTieBreakStart(tieBreakPollId, length);

  const floors = voteCounts.map((voteCount) => {
    return Math.floor((voteCount * 100) / totalVotes);
  });
  const remainder =
    100 -
    floors.reduce((sum, floorValue) => {
      return sum + floorValue;
    }, 0);

  const order = voteCounts
    .map((voteCount, index) => {
      return {
        index,
        remainder: (voteCount * 100) % totalVotes,
      };
    })
    .sort((a, b) => {
      if (b.remainder !== a.remainder) {
        return b.remainder - a.remainder;
      }

      return cyclicRank(a.index, startIndex, length) - cyclicRank(b.index, startIndex, length);
    });

  const result = [...floors];

  for (let k = 0; k < remainder; k++) {
    result[order[k].index] += 1;
  }

  return result;
};

export default distributePollPercentages;
