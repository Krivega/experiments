/// <reference types="jest" />
import { worker as workerResolvers } from '../index';

type TPayload = {
  value?: string;
};

type TWorkerMocked = Worker & {
  listener?: EventListener;
  triggerEventListener: (event: ErrorEvent | MessageEvent) => void;
};

const TWO_CALLS_COUNT = 2;

const undefinedResult = undefined;

const type = 'type';
const actionType = 'actionType';
const payload: TPayload = {
  value: 'value',
};

describe('worker', () => {
  it('resolvePayloadAction', () => {
    const payloadAction = workerResolvers.resolvePayloadAction<TPayload>(type);
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    const payloadActionWithoutParameters = workerResolvers.resolvePayloadAction<void>(type);

    expect(payloadAction(payload)).toEqual({ type, payload });
    expect(payloadActionWithoutParameters()).toEqual({ type });
  });

  it('resolveActionHandler', () => {
    const actionHandler = workerResolvers.resolveActionHandler<TPayload | undefined>(actionType);
    const handlerMocked = jest.fn();

    const eventHandler = actionHandler(handlerMocked);

    eventHandler({ payload, type: actionType });

    expect(handlerMocked).toHaveBeenCalledOnce();
    expect(handlerMocked).toHaveBeenCalledWith(payload);

    eventHandler({ type: actionType, payload: undefined });

    expect(handlerMocked).toHaveBeenCalledTimes(TWO_CALLS_COUNT);
    expect(handlerMocked).toHaveBeenCalledWith(undefined);
  });

  it('resolveActionSender', () => {
    const worker = {} as TWorkerMocked;

    const postMessageMocked = jest.fn();

    worker.postMessage = (data) => {
      postMessageMocked(data);
    };

    const payloadActionMocked = jest.fn();

    const payloadAction = (value: TPayload) => {
      payloadActionMocked(value);

      return { type, payload: value };
    };

    const send = workerResolvers.resolveActionSender<TPayload>(worker, payloadAction);

    send(payload);

    expect(payloadActionMocked).toHaveBeenCalledOnce();
    expect(payloadActionMocked).toHaveBeenCalledWith(payload);
  });

  it('resolveActionReceiver', () => {
    const worker = {
      addEventListener(_message: keyof WorkerEventMap, listener: EventListener) {
        this.listener = listener;
      },
      triggerEventListener(event: MessageEvent) {
        if (this.listener) {
          this.listener(event);
        }
      },
    } as TWorkerMocked;

    const actionReceiver = workerResolvers.resolveActionReceiver(worker);

    const actionHandler = jest.fn();

    actionReceiver(actionHandler);

    const event = { data: payload } as MessageEvent<TPayload>;

    worker.triggerEventListener(event);

    expect(actionHandler).toHaveBeenCalledOnce();
    expect(actionHandler).toHaveBeenCalledWith(payload);

    const errorEvent = {} as ErrorEvent;

    worker.triggerEventListener(errorEvent);

    expect(actionHandler).toHaveBeenCalledTimes(TWO_CALLS_COUNT);
    expect(actionHandler).toHaveBeenNthCalledWith(TWO_CALLS_COUNT, undefinedResult);
  });
});
