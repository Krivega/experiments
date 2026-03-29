import { useMachine } from '@xstate/react';
import { useCallback, useRef } from 'react';

import { createPromiseMachine, promiseMachineConstants } from '../../../state-management';

const {
  EVENT_IDLE,
  EVENT_PENDING,
  EVENT_REJECT,
  EVENT_RESOLVE,
  STATUS_IDLE,
  STATUS_PENDING,
  STATUS_REJECTED,
  STATUS_RESOLVED,
} = promiseMachineConstants;

const usePromiseMachine = <T>() => {
  const promiseMachineReference = useRef(
    createPromiseMachine<T>({ response: undefined, error: undefined }),
  );
  const [state, send] = useMachine(promiseMachineReference.current);

  const sendIdle = useCallback(() => {
    send({ type: EVENT_IDLE });
  }, [send]);

  const sendPending = useCallback(() => {
    send({ type: EVENT_PENDING });
  }, [send]);

  const sendResolve = useCallback(
    (response: T) => {
      send({ type: EVENT_RESOLVE, response });
    },
    [send],
  );

  const sendReject = useCallback(
    (error: string) => {
      send({ type: EVENT_REJECT, error });
    },
    [send],
  );

  return {
    sendIdle,
    sendPending,
    sendResolve,
    sendReject,
    response: state.context.response,
    error: state.context.error,
    isIdle: state.matches(STATUS_IDLE),
    isPending: state.matches(STATUS_PENDING),
    isResolved: state.matches(STATUS_RESOLVED),
    isRejected: state.matches(STATUS_REJECTED),
  };
};

export default usePromiseMachine;
