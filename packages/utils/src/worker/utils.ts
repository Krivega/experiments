interface ITransferData<T = any> {
  type: string;
  payload: T;
}
interface ITransferEvent extends Event {
  data: ITransferData;
}

export interface IActionHandler<T = any> {
  (payload: T): void;
}

interface ITransferHandler<T = any> {
  (data: ITransferData<T>): void;
}

export const resolvePayloadAction = (type: string) => {
  return (payload?: any) => {
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
    return (payload?: any, transfer?: Transferable[]) => {
      worker.postMessage(action(payload), transfer!);
    };
  };
};

const getDataFromTransferEvent = (event: ITransferEvent) => {
  return event.data;
};

export const resolveActionReceiver = <T>(worker: Worker, message: string = 'message') => {
  return (handler: ITransferHandler<T>) => {
    worker.addEventListener(message, (event) => {
      return handler(getDataFromTransferEvent(event as ITransferEvent));
    });
  };
};

const getDoneActionType = (type: string): string => {
  return `${type}:done`;
};

export const resolveWaitActionDone = <T>(worker: Worker, type: string) => {
  return (): Promise<T> => {
    const onReceiveMessage = resolveActionReceiver<T>(worker);
    const handleActionDone = resolveActionHandler<T>(getDoneActionType(type));

    return new Promise((resolve) => {
      const resolveWhenDone = handleActionDone(resolve);

      onReceiveMessage(resolveWhenDone);
    });
  };
};

export const resolveSendActionDone = (worker: Worker, type: string) => {
  return ({ payload, transfer }: { payload?: any; transfer?: Transferable[] }) => {
    const resolveSendAction = resolveActionSender(worker);
    const payloadActionDone = resolvePayloadAction(getDoneActionType(type));
    const sendActionDone = resolveSendAction(payloadActionDone);

    sendActionDone(payload, transfer);
  };
};
