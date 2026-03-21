type TCache<TP, TR> = {
  params: TP;
  result: TR;
};

const resolveSkipDuplicatedCalls = <TP, TR = void>(
  function_: (parameters: TP) => TR,
  hasEqual: (value: TP, other: TP) => boolean,
) => {
  let cache = {} as TCache<TP, TR>;

  const skipDuplicatedCalls = (parameters: TP): TR => {
    if (hasEqual(cache.params, parameters)) {
      return cache.result;
    }

    const result = function_(parameters);

    cache = { params: parameters, result };

    return result;
  };

  const updateParameters = (parametersForUpdate: TP) => {
    cache = { ...cache, params: parametersForUpdate };
  };

  return { skipDuplicatedCalls, updateParams: updateParameters };
};

export default resolveSkipDuplicatedCalls;
