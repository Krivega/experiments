export const changeParameter = (name: string, value?: string) => {
  const searchParameters = new URLSearchParams(window.location.search);

  if (value !== undefined && value !== '') {
    searchParameters.set(name, value);
  } else {
    searchParameters.delete(name);
  }

  window.history.replaceState('', '', `?${searchParameters.toString()}`);
};

export const getParameter = (name: string) => {
  const searchParameters = new URLSearchParams(window.location.search);

  return searchParameters.get(name);
};
