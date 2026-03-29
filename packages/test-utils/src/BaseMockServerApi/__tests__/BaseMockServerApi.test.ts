import BaseMockServerApi from '../BaseMockServerApi';

type TEventMap = {
  changeValue: { value: number };
};

class MockServerApi extends BaseMockServerApi<TEventMap> {}

describe('BaseMockServerApi', () => {
  let serverApi: MockServerApi;

  beforeEach(() => {
    serverApi = new MockServerApi();
  });

  it('должен возвращать успешный request с обработчиком abort по умолчанию', async () => {
    const data = { ok: true };

    const response = serverApi.request(data);

    await expect(response.promise).resolves.toEqual(data);
    expect(response.abort).toBe(serverApi.abort);
  });

  it('должен вызывать abort обработчик из ответа request', () => {
    const response = serverApi.request('data');

    response.abort();

    expect(serverApi.abort).toHaveBeenCalledTimes(1);
  });

  it('должен отклонять request с ошибкой failed при включенном fail-режиме', async () => {
    serverApi.setFailAllRequests();

    await expect(serverApi.request('data').promise).rejects.toThrow('failed');
  });

  it('должен сбрасывать fail-режим и снова разрешать request', async () => {
    serverApi.setFailAllRequests();
    serverApi.resetFailAllRequests();

    await expect(serverApi.request('data').promise).resolves.toBe('data');
  });

  it('должен отклонять request с ошибкой aborted при включенном abort-режиме', async () => {
    serverApi.setAbortAllRequests();

    await expect(serverApi.request('data').promise).rejects.toThrow('aborted');
    expect(serverApi.hasAbortedError()).toBe(true);
  });

  it('должен сбрасывать abort-режим', () => {
    serverApi.setAbortAllRequests();
    serverApi.resetAbortAllRequests();

    expect(serverApi.hasAbortedError()).toBe(false);
  });

  it('должен применять состояние fail из конструктора', async () => {
    serverApi = new MockServerApi({ isFailAllRequests: true });

    await expect(serverApi.request('data').promise).rejects.toThrow('failed');
  });

  it('должен применять состояние aborted из конструктора', async () => {
    serverApi = new MockServerApi({ isAbortedError: true });

    expect(serverApi.hasAbortedError()).toBe(true);
    await expect(serverApi.request('data').promise).rejects.toThrow('aborted');
  });

  it('должен сбрасывать все флаги ошибок', async () => {
    serverApi = new MockServerApi({ isFailAllRequests: true, isAbortedError: true });

    serverApi.reset();

    expect(serverApi.hasAbortedError()).toBe(false);
    await expect(serverApi.request('data').promise).resolves.toBe('data');
  });

  it('должен подписываться и эмитить типизированные события', () => {
    serverApi = new MockServerApi(undefined, ['changeValue']);

    const callback = jest.fn();
    const dispose = serverApi.onEvent('changeValue', callback);

    serverApi.emitEvent('changeValue', { value: 42 });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith({ value: 42 });

    dispose();

    serverApi.emitEvent('changeValue', { value: 43 });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
