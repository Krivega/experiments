const findBySelector = (container: HTMLElement, selector: string, indexNumber = 0): Element => {
  const resultsList = container.querySelectorAll(selector);
  const result = resultsList[indexNumber] as Element | undefined;

  if (result !== undefined) {
    return result;
  }

  throw new Error(
    `Error: no element with selector: ${selector} (${indexNumber}-nth-child) in ${container.className}`,
  );
};

export default findBySelector;
