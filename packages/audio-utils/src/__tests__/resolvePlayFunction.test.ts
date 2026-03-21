/// <reference types="jest" />
import resolvePlayFunction from '../resolvePlayFunction';

describe('resolvePlayFunction', () => {
  it('#1 should be calculated correctly sin of tone', () => {
    const toneStart = 941;
    const toneEnd = 1336;
    const volume = 1;
    const timeFloat = 0.01;
    const playFunction = resolvePlayFunction({
      toneStart,
      toneEnd,
      volume,
    });

    const result = playFunction(timeFloat, 0, 0);

    expect(result).toBe(0.653_170_018_877_393_9);
  });
});
