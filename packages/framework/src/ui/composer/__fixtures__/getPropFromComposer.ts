type TComposer<T> = {
  argumentsCalledWith: Record<string, T>[];
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const getPropFromComposer = <T>(composer: unknown, propName: string): T | undefined => {
  const { argumentsCalledWith } = composer as TComposer<T>;

  return argumentsCalledWith.find((args) => {
    return propName in args;
  })?.[propName];
};

export default getPropFromComposer;
