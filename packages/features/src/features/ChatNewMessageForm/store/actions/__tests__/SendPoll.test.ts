import delayPromise from 'promise-delay';

import { Model } from '../../@Model';
import SendPoll from '../SendPoll';

import type { TInstance } from '../../@Model';

const mockServerApi = {
  sendMessage: jest.fn(),
};

const DELAY = 100;

describe('SendPoll', () => {
  let action: SendPoll;
  let instance: TInstance;

  beforeEach(() => {
    instance = Model.create();

    action = new SendPoll({
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

  it('не должен вызывать serverApi.sendMessage, если опрос не валиден', async () => {
    expect(instance.fields.canSubmitPoll).toBe(false);

    action.execute(undefined);

    await delayPromise(DELAY);

    expect(mockServerApi.sendMessage).toHaveBeenCalledTimes(0);
  });

  it('должен вызывать serverApi.sendMessage и resetPoll, если опрос валиден', async () => {
    instance.fields.setPollQuestion('Question?');
    instance.fields.setPollOption(0, 'A');
    instance.fields.setPollOption(1, 'B');

    expect(instance.fields.canSubmitPoll).toBe(true);

    action.execute(undefined);

    await delayPromise(DELAY);

    expect(mockServerApi.sendMessage).toHaveBeenCalledTimes(1);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const encoded = mockServerApi.sendMessage.mock.calls[0][0];

    expect(encoded).toContain('[POLL]');
    expect(encoded).toContain('Question?');
    expect(encoded).toContain('A');
    expect(encoded).toContain('B');

    expect(instance.fields.pollQuestion).toBe('');
    expect(instance.fields.pollOptions).toEqual(['', '']);
  });
});
