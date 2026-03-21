interface ITransferData<T = unknown> {
  type: string;
  payload: T;
}
interface ITransferEvent<T = unknown> extends Event {
  data: ITransferData<T>;
}

export type IActionHandler<T = unknown> = (payload: T) => void;

type ITransferHandler<T = unknown> = (data: ITransferData<T>) => void;

export const resolvePayloadAction = (type: string) => {
  return (payload?: unknown) => {
    return {
      type,
      payload,
    };
  };
};

type TAction = ReturnType<typeof resolvePayloadAction>;

export const resolveActionHandler = <T>(actionType: string) => {
  return (handler: IActionHandler<T>) => {
    return (data: ITransferData<T>) => {
      const { type, payload } = data;

      if (type === actionType) {
        handler(payload);
      }
    };
  };
};

export const resolveActionSender = (worker: Worker) => {
  return (action: TAction) => {
    return (payload?: unknown, transfer?: Transferable[]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      worker.postMessage(action(payload), transfer!);
    };
  };
};

const getDataFromTransferEvent = <T>(event: ITransferEvent<T>): ITransferData<T> => {
  return event.data;
};

export const resolveActionReceiver = <T>(worker: Worker, message = 'message') => {
  return (handler: ITransferHandler<T>) => {
    worker.addEventListener(message, (event) => {
      handler(getDataFromTransferEvent(event as ITransferEvent<T>));
    });
  };
};

const getDoneActionType = (type: string): string => {
  return `${type}:done`;
};

export const resolveWaitActionDone = <T>(worker: Worker, type: string) => {
  return async (): Promise<T> => {
    const onReceiveMessage = resolveActionReceiver<T>(worker);
    const handleActionDone = resolveActionHandler<T>(getDoneActionType(type));

    return new Promise((resolve) => {
      const resolveWhenDone = handleActionDone(resolve);

      onReceiveMessage(resolveWhenDone);
    });
  };
};

export const resolveSendActionDone = (worker: Worker, type: string) => {
  return ({ payload, transfer }: { payload?: unknown; transfer?: Transferable[] }) => {
    const resolveSendAction = resolveActionSender(worker);
    const payloadActionDone = resolvePayloadAction(getDoneActionType(type));
    const sendActionDone = resolveSendAction(payloadActionDone);

    sendActionDone(payload, transfer);
  };
};
