import { NoiseSuppressionEffectBase } from './NoiseSuppressionEffectBase';

import type { NoiseSuppressionEffectBaseOptions } from './NoiseSuppressionEffectBase';

const DTLN_PROCESSOR_NAME = 'NoiseSuppressorDtlnWorklet';
const DTLN_SAMPLE_RATE = 16_000;

class NoiseSuppressionDtlnEffect extends NoiseSuppressionEffectBase {
  public constructor(
    workletUrl: string,
    options: Omit<NoiseSuppressionEffectBaseOptions, 'processorName' | 'audioContextOptions'> = {},
  ) {
    super(workletUrl, {
      ...options,
      processorName: DTLN_PROCESSOR_NAME,
      audioContextOptions: {
        sampleRate: DTLN_SAMPLE_RATE,
      },
    });
  }
}

export default NoiseSuppressionDtlnEffect;
