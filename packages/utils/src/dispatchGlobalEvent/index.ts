type TDispatchedGlobalEvent<T> = Event & {
  data?: T;
};

const dispatchGlobalEvent = (eventName: string, parameters?: unknown) => {
  const event: TDispatchedGlobalEvent<unknown> = new Event(eventName);

  event.data = parameters;

  window.dispatchEvent(event);
};

export default dispatchGlobalEvent;
