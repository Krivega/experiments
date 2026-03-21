import type { TActionHandler, TPayloadAction, TPayloadEvent, TWorkerEvent } from './types';

export const resolvePayloadAction = <T, K = string>(type: K): TPayloadAction<T, K> => {
  return (payload: T): TPayloadEvent<T, K> => {
    return {
      type,
      payload,
    };
  };
};

export const resolveActionHandler = <T, K = string>(actionType: K) => {
  return (handler: TActionHandler<T>) => {
    return (event: TPayloadEvent<T, K>) => {
      const { type, payload } = event;

      if (type === actionType) {
        handler(payload);
      }
    };
  };
};

export const resolveActionSender = <T, K = string>(
  worker: Worker,
  action: TPayloadAction<T, K>,
) => {
  return (value: T, transfer?: Transferable[]) => {
    if (transfer) {
      worker.postMessage(action(value), transfer);

      return;
    }

    worker.postMessage(action(value));
  };
};

const getDataFromWorkerEvent = <T>(event: TWorkerEvent<T>): T | undefined => {
  if ('data' in event) {
    return event.data;
  }

  return undefined;
};

export const resolveActionReceiver = (
  worker: Worker,
  message: keyof WorkerEventMap = 'message',
) => {
  return <T>(handler: TActionHandler<T>) => {
    worker.addEventListener(message, (event: TWorkerEvent<T>) => {
      const data = getDataFromWorkerEvent<T>(event) as T;

      handler(data);
    });
  };
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
const resolveSendAction = <T>(worker: Worker, type: string) => {
  return (payload?: T, transfer?: Transferable[]): void => {
    const payloadAction = resolvePayloadAction(type);
    const sendAction = resolveActionSender(worker, payloadAction);

    sendAction(payload, transfer);
  };
};

const resolveOnReceiveAction = <T>(worker: Worker, actionType: string) => {
  return (handler: TActionHandler<T>) => {
    const onReceiveMessage = resolveActionReceiver(worker, 'message');
    const handleAction = resolveActionHandler<T>(actionType);

    onReceiveMessage(handleAction(handler));
  };
};

export const resolveAction = <T>(worker: Worker, type: string) => {
  const sendAction = resolveSendAction<T>(worker, type);
  const onReceiveAction = resolveOnReceiveAction<T>(worker, type);

  return { sendAction, onReceiveAction };
};
