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

interface ITransferHandlerPromised<T = any> {
  (data: T): Promise<{ payload?: any; transfer?: Transferable[] }>;
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

/**
 * resolve action with pong from worker
 *
 * @param {object} worker  - The worker
 * @param {string} type - The type of action
 * @param {string} message - The message
 *
 * @returns     {Function}  action
 */
export const resolveActionToWorker = <T>(worker: Worker, type: string, message: string) => {
  return (payload?: any, transfer?: Transferable[]) => {
    const onReceiveMessage = resolveActionReceiver<T>(worker, message);
    const handleActionDone = resolveActionHandler<T>(`${type}:done`);
    const resolveActionSenderToWorker = resolveActionSender(worker);
    const payloadAction = resolvePayloadAction(type);
    const sendActionToWorker = resolveActionSenderToWorker(payloadAction);

    return new Promise((resolve) => {
      const resolveWhenDone = handleActionDone(resolve);

      onReceiveMessage(resolveWhenDone);
      sendActionToWorker(payload, transfer);
    });
  };
};

export const resolveActionToClient = <T>(worker: Worker, type: string, message: string) => {
  return (handler: ITransferHandlerPromised<T>) => {
    const onReceiveMessage = resolveActionReceiver<T>(worker, message);
    const handleAction = resolveActionHandler<T>(type);
    const resolveActionSenderToWorker = resolveActionSender(worker);
    const payloadActionDone = resolvePayloadAction(`${type}:done`);
    const sendActionDoneToClient = resolveActionSenderToWorker(payloadActionDone);

    const runAction = handleAction((payload) => {
      handler(payload).then(({ payload: payloadToSend, transfer } = {}) => {
        sendActionDoneToClient(payloadToSend, transfer);
      });
    });

    onReceiveMessage(runAction);
  };
};
