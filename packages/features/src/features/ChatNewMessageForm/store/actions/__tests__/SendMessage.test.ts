import delayPromise from 'promise-delay';

import { Model } from '../../@Model';
import SendMessage from '../SendMessage';

import type { TInstance } from '../../@Model';

const mockServerApi = {
  sendMessage: jest.fn(),
};

const DELAY = 100;

describe('SendMessage', () => {
  let action: SendMessage;

  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();

    action = new SendMessage({
      instance,
      dependencies: {
        serverApi: mockServerApi,
        coreApi: undefined,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('не должен вызывать serverApi.sendMessage, если сообщение не валидно', async () => {
    action.execute(undefined);

    await delayPromise(DELAY);

    expect(instance.canSave()).toBe(false);
    expect(instance.currentState.textMessage).toBe('');
    expect(mockServerApi.sendMessage).toHaveBeenCalledTimes(0);
  });

  it('должен вызывать serverApi.sendMessage, если сообщение валидно', async () => {
    instance.fields.textMessageField.setValue('message');

    expect(instance.canSave()).toBe(true);
    expect(instance.currentState.textMessage).toBe('message');

    action.execute(undefined);

    await delayPromise(DELAY);

    expect(mockServerApi.sendMessage).toHaveBeenCalledWith('message');
  });

  it('должен сбросить состояние, если сообщение отправлено', async () => {
    instance.fields.textMessageField.setValue('message');

    action.execute(undefined);

    await delayPromise(DELAY);

    expect(instance.currentState.textMessage).toBe('');
  });
});
