import {
  NoiseSuppressionEffectBase,
  type NoiseSuppressionEffectBaseOptions,
} from './NoiseSuppressionEffectBase';

const DEFAULT_RNNOISE_PROCESSOR_NAME = 'NoiseSuppressorRnnoiseWorklet';

export interface NoiseSuppressionRnnoiseEffectOptions extends Omit<
  NoiseSuppressionEffectBaseOptions,
  'processorName'
> {
  processorName?: string;
}

class NoiseSuppressionRnnoiseEffect extends NoiseSuppressionEffectBase {
  public constructor(workletUrl: string, options: NoiseSuppressionRnnoiseEffectOptions = {}) {
    super(workletUrl, {
      ...options,
      processorName: options.processorName ?? DEFAULT_RNNOISE_PROCESSOR_NAME,
    });
  }
}

export default NoiseSuppressionRnnoiseEffect;
