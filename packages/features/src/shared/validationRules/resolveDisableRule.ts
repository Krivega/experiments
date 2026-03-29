const DISABLED = 'DISABLED';

const getDisabledState = (): string => {
  return DISABLED;
};

const resolveDisableRule = <TState>(hasEnabled: (state: TState) => boolean) => {
  return (state: TState): (() => string)[] => {
    return hasEnabled(state) ? [] : [getDisabledState];
  };
};

export default resolveDisableRule;
