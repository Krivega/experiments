export const createDocumentElement = (tagName = 'div', attributes: Record<string, string> = {}) => {
  const element = document.createElement(tagName);

  return Object.entries(attributes).reduce((accumulator, [key, value]) => {
    accumulator.setAttribute(key, value);

    return accumulator;
  }, element);
};

export const addToBodyElement = (element: HTMLDivElement): HTMLDivElement => {
  // eslint-disable-next-line unicorn/prefer-dom-node-append
  return document.body.appendChild(element);
};

export const addOnceEventListener = (eventName: string, handler: EventListener) => {
  const removeEventListener = (handlerToRemove: EventListener) => {
    document.removeEventListener(eventName, handlerToRemove);
  };

  const onceHandler = (event: Event) => {
    handler(event);
    removeEventListener(onceHandler);
  };

  document.addEventListener(eventName, onceHandler);

  return () => {
    removeEventListener(onceHandler);
  };
};
