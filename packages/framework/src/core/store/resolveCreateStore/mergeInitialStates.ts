const mergeInitialStates = (initialStates: object[]) => {
  return initialStates.reduce((accumulator, initialState) => {
    return { ...accumulator, ...initialState };
  }, {});
};

export default mergeInitialStates;
