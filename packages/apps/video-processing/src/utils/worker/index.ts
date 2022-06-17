import {
  resolveActionSender,
  resolvePayloadAction,
  resolveActionReceiver,
  resolveActionHandler,
  resolveWaitActionDone,
  resolveSendActionDone,
} from './utils';
import type { IActionHandler } from './utils';

const resolveSendAction = <T = any>(worker: Worker, type: string) => {
  return (payload?: T, transfer?: Transferable[]): void => {
    const resolveSendActionInner = resolveActionSender(worker);
    const payloadAction = resolvePayloadAction(type);
    const sendAction = resolveSendActionInner(payloadAction);

    sendAction(payload, transfer);
  };
};

const resolveSendActionAndWaitConfirm = <P = any, R = any>(worker: Worker, type: string) => {
  return (payload?: P, transfer?: Transferable[]): Promise<R> => {
    const waitActionDone = resolveWaitActionDone<R>(worker, type);
    const sendAction = resolveSendAction<P>(worker, type);

    const promise = waitActionDone();

    sendAction(payload, transfer);

    return promise;
  };
};

const resolveOnReceiveAction = <T>(worker: Worker, actionType: string) => {
  return (handler: IActionHandler<T>) => {
    const onReceiveMessage = resolveActionReceiver<T>(worker, 'message');
    const handleAction = resolveActionHandler<T>(actionType);

    onReceiveMessage(handleAction(handler));
  };
};

type THandlerAction<P = any> = (payload: P) => Promise<{ payload?: P; transfer?: Transferable[] }>;

const resolveOnReceiveActionAndWaitConfirm = <P = any>(worker: Worker, type: string) => {
  return (handler: THandlerAction<P>) => {
    const onReceiveAction = resolveOnReceiveAction<P>(worker, type);
    const sendActionDone = resolveSendActionDone(worker, type);

    onReceiveAction((payload: P) => {
      handler(payload).then(({ payload: payloadToSend, transfer }) => {
        sendActionDone({ transfer, payload: payloadToSend });
      });
    });
  };
};

export const resolveAction = <T>(worker: Worker, type: string) => {
  const sendAction = resolveSendAction<T>(worker, type);
  const onReceiveAction = resolveOnReceiveAction<T>(worker, type);

  return { sendAction, onReceiveAction };
};

export const resolveActionWithWaitConfirm = <P, R = P>(worker: Worker, type: string) => {
  const sendActionAndWaitConfirm = resolveSendActionAndWaitConfirm<P, R>(worker, type);
  const onReceiveActionAndWaitConfirm = resolveOnReceiveActionAndWaitConfirm<P>(worker, type);

  return { sendActionAndWaitConfirm, onReceiveActionAndWaitConfirm };
};
