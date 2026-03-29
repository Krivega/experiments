import flushPromises from '../flushPromises';

describe('flushPromises', () => {
  it('должен резолвиться без возвращаемого значения', async () => {
    await expect(flushPromises()).resolves.toBeUndefined();
  });

  it('должен дожидаться выполнения запланированной микротаски', async () => {
    const callback = jest.fn();

    process.nextTick(callback);

    expect(callback).not.toHaveBeenCalled();

    await flushPromises();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
