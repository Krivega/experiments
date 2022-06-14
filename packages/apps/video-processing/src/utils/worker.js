/**
 * resolve payloadAction
 *
 * @param {string} type - The type
 *
 * @returns {Function} payloadAction
 */
export const resolvePayloadAction = (type) => (payload) => ({
  type,
  payload,
});

/**
 * resolve actionHandler
 *
 * @param {string} actionType - The action type
 *
 * @returns {Function} actionHandler
 */
export const resolveActionHandler = (actionType) => (handler) => (event) => {
  const { type, payload } = event;

  if (type === actionType) {
    handler(payload);
  }
};

/**
 * resolve actionSender
 *
 * @param {object} worker - The worker
 *
 * @returns {Function} actionSender
 */
export const resolveActionSender = (worker) => (action) => (value, transfer) => {
  worker.postMessage(action(value), transfer);
};

const getDataFromWorkerEvent = (event) => event.data;

/**
 * resolve actionReceiver
 *
 * @param {object} worker  - The worker
 * @param {string} message - The message
 *
 * @returns     {Function}  action
 */
export const resolveActionReceiver = (worker, message = 'message') => (handler) => {
  worker.addEventListener(message, (event) => handler(getDataFromWorkerEvent(event)));
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
export const resolveActionToWorker = (worker, type, message) => (payload, transfer) => {
  const onReceiveMessage = resolveActionReceiver(worker, message);
  const handleActionDone = resolveActionHandler(`${type}:done`);
  const resolveActionSenderToWorker = resolveActionSender(worker);
  const payloadAction = resolvePayloadAction(type);
  const sendActionToWorker = resolveActionSenderToWorker(payloadAction);

  return new Promise((resolve) => {
    const resolveWhenDone = handleActionDone(resolve);

    onReceiveMessage(resolveWhenDone);
    sendActionToWorker(payload, transfer);
  });
};

export const resolveActionToClient = (worker, type, message) => (handler) => {
  const onReceiveMessage = resolveActionReceiver(worker, message);
  const handleAction = resolveActionHandler(type);
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
