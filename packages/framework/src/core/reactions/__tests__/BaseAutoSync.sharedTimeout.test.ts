import { waitFor } from '@testing-library/react';
import { observable } from 'mobx';

import { BaseAutoSync, type IAutoSyncInstance, type IServerApi } from '../BaseAutoSync';

describe('BaseAutoSync – shared timeoutRequester side-effect', () => {
  jest.useFakeTimers();

  interface ITestData {
    state: Record<string, unknown>;
    dependentData: Record<string, unknown>;
  }

  class TestAutoSync extends BaseAutoSync<ITestData> {
    public callWriteFromSocket(data: ITestData): void {
      this.writeFromSocket(data);
    }
  }

  const createInstanceState = () => {
    return observable.object({
      isSaveInProgress: false,
      isSyncRetry: false,
      isSyncError: false,
    });
  };

  const createMockInstance = (
    state: ReturnType<typeof createInstanceState>,
  ): IAutoSyncInstance<ITestData> => {
    return {
      ...state,
      setSyncInProgress: jest.fn(),
      setSyncError: jest.fn(),
      setSyncRetry: jest.fn().mockImplementation(() => {
        // eslint-disable-next-line no-param-reassign
        state.isSyncRetry = true;
      }),
      fill: jest.fn(),
    } as unknown as IAutoSyncInstance<ITestData>;
  };

  const createRejectingServerApi = (): IServerApi<ITestData> => {
    return {
      getData: jest.fn(() => {
        return {
          promise: Promise.reject(new Error('fail')),
          abort: jest.fn(),
        };
      }),
    };
  };

  it('stopping one AutoSync instance should not cancel retries of another', async () => {
    const stateA = createInstanceState();
    const stateB = createInstanceState();

    const instanceA = createMockInstance(stateA);
    const instanceB = createMockInstance(stateB);

    const serverApiA = createRejectingServerApi();
    const serverApiB = createRejectingServerApi();

    const autoSyncA = new TestAutoSync(
      {
        instance: instanceA,
        dependencies: { serverApi: serverApiA },
        executableActions: {},
      },
      { requestInterval: 50 },
    );
    const autoSyncB = new TestAutoSync(
      {
        instance: instanceB,
        dependencies: { serverApi: serverApiB },
        executableActions: {},
      },
      { requestInterval: 50 },
    );

    autoSyncA.start();
    autoSyncB.start();

    // ждём первой попытки ретрая у B
    await waitFor(() => {
      expect(instanceB.setSyncRetry).toHaveBeenCalledTimes(1);
    });

    // теперь вызываем stop для первого — он отменит свой таймер
    // (и общий, если используется shared requester)
    autoSyncA.stop();

    // запускаем только pending таймеры
    await jest.runOnlyPendingTimersAsync();

    // для корректной реализации setSyncRetry у B должен быть вызван второй раз
    expect(instanceB.setSyncRetry).toHaveBeenCalledTimes(2);
  });
});
