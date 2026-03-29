import { EventEmitterProxy, TypedEvents } from 'events-constructor';

type TState = {
  isFailAllRequests: boolean;
  isAbortedError: boolean;
};

type TEventMapRecord = Record<string, unknown>;

type TEventName<TEventMap extends TEventMapRecord> = Extract<keyof TEventMap, string>;

const createEvents = <TEventMap extends TEventMapRecord>(
  eventNames: TEventName<TEventMap>[],
): TypedEvents<TEventMap> => {
  return new TypedEvents<TEventMap>(eventNames);
};

class BaseMockServerApi<
  TEventMap extends TEventMapRecord = Record<string, unknown>,
> extends EventEmitterProxy<TEventMap> {
  public request = jest.fn(<TData>(data: TData) => {
    if (this.state.isFailAllRequests) {
      return {
        promise: Promise.reject(new Error('failed')),
        abort: this.abort,
      };
    }

    if (this.state.isAbortedError) {
      return {
        promise: Promise.reject(new Error('aborted')),
        abort: this.abort,
      };
    }

    return {
      promise: Promise.resolve(data),
      abort: this.abort,
    };
  });

  public abort = jest.fn(() => {});

  private readonly state: TState = {
    isFailAllRequests: false,
    isAbortedError: false,
  };

  public constructor(state?: Partial<TState>, eventNames: TEventName<TEventMap>[] = []) {
    super(createEvents<TEventMap>(eventNames));
    this.state.isAbortedError = state?.isAbortedError ?? this.state.isAbortedError;
    this.state.isFailAllRequests = state?.isFailAllRequests ?? this.state.isFailAllRequests;
  }

  public setFailAllRequests = () => {
    this.state.isFailAllRequests = true;
  };

  public resetFailAllRequests = () => {
    this.state.isFailAllRequests = false;
  };

  public setAbortAllRequests = () => {
    this.state.isAbortedError = true;
  };

  public resetAbortAllRequests = () => {
    this.state.isAbortedError = false;
  };

  public reset = () => {
    this.resetFailAllRequests();
    this.resetAbortAllRequests();
  };

  public hasAbortedError = () => {
    return this.state.isAbortedError;
  };

  public onEvent = <TName extends TEventName<TEventMap>>(
    eventName: TName,
    callback: (params: TEventMap[TName]) => void,
  ) => {
    return this.events.on(eventName, callback);
  };

  public emitEvent = <TName extends TEventName<TEventMap>>(
    eventName: TName,
    params: TEventMap[TName],
  ) => {
    this.events.emit(eventName, params);
  };
}

export default BaseMockServerApi;
