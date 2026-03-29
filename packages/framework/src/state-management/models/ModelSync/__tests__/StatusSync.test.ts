/// <reference types="jest" />
import { onAction, types } from 'mobx-state-tree';

import ModelSync from '../ModelSync';
import StatusSync from '../StatusSync';

import type { TInstanceModel } from '@experiments/mst-tools';

const MockModel = types
  .model({
    status: types.optional(ModelSync, {}),
  })
  .views((self) => {
    return {
      get isSyncInProgress() {
        return self.status.isSyncInProgress;
      },
      get isSynced() {
        return self.status.isSynced;
      },
      get isSyncRetry() {
        return self.status.isSyncRetry;
      },
    };
  })
  .actions((self) => {
    return {
      setSynced: () => {
        self.status.setSynced();
      },
      setIsSyncInProgress: () => {
        self.status.setSyncInProgress();
      },
      setIsSyncRetry: () => {
        self.status.setSyncRetry();
      },
      fill: () => {
        // мокаем fill
      },
    };
  });

const mockedFill = jest.fn();
const mockedSetSynced = jest.fn();
const ModelWithMockedMethods = types
  .model()
  .views(() => {
    return {
      get isSyncInProgress() {
        return true;
      },
      get isSyncRetry() {
        return true;
      },
    };
  })
  .actions(() => {
    return {
      setSynced: mockedSetSynced,
      fill: mockedFill,
    };
  });

describe('StatusAutoSync', () => {
  let instance: TInstanceModel<typeof MockModel>;
  let statusSync: StatusSync<typeof instance>;

  beforeEach(() => {
    instance = MockModel.create();
    statusSync = new StatusSync(instance);
  });

  afterEach(() => {
    statusSync.unsubscribe();
    jest.clearAllMocks();
  });

  describe('Реакция на изменение поля', () => {
    it('вызывает setSynced, если isSyncInProgress === true', async () => {
      statusSync.subscribe();

      instance.setIsSyncInProgress();

      instance.fill();

      expect(instance.isSynced).toBe(true);
      expect(instance.isSyncInProgress).toBe(false);
      expect(instance.status.isSynced).toBe(true);
    });

    it('не вызывает setSynced, если isSyncInProgress === false или isSyncRetry === false', () => {
      statusSync.subscribe();

      instance.fill();

      expect(instance.isSynced).toBe(false);
      expect(instance.isSyncInProgress).toBe(false);
      expect(instance.status.isSynced).toBe(false);
    });

    it('вызывает setSynced, если isSyncRetry === true', () => {
      statusSync.subscribe();

      instance.status.setSyncInProgress();
      instance.status.setSyncRetry();

      instance.fill();

      expect(instance.isSynced).toBe(true);
      expect(instance.isSyncRetry).toBe(false);
      expect(instance.status.isSynced).toBe(true);
    });

    it('не вызывает setSynced, если не было вызова fill', () => {
      statusSync.subscribe();

      instance.setIsSyncInProgress();

      expect(instance.isSynced).toBe(false);
      expect(instance.status.isSynced).toBe(false);
    });
  });

  describe('Управление реакциями', () => {
    it('отписывается от всех реакций при вызове unsubscribe', () => {
      const mockDisposer = jest.fn();
      const originalOnAction = onAction;

      (onAction as jest.Mock) = jest.fn(() => {
        return mockDisposer;
      });

      statusSync.subscribe();
      statusSync.unsubscribe();

      expect(mockDisposer).toHaveBeenCalled();

      (onAction as unknown) = originalOnAction;
    });

    it('очищает предыдущие подписки при повторном вызове subscribe', () => {
      const mockDisposer = jest.fn();
      const originalOnAction = onAction;

      (onAction as jest.Mock) = jest.fn(() => {
        return mockDisposer;
      });

      statusSync.subscribe();
      statusSync.subscribe();

      expect(mockDisposer).toHaveBeenCalled();

      (onAction as unknown) = originalOnAction;
    });

    it('корректно вызывает onAction и сохраняет диспозер', () => {
      const originalOnAction = onAction;
      const mockDisposer = jest.fn();
      const mockOnAction = jest.fn(() => {
        return mockDisposer;
      });

      (onAction as unknown) = mockOnAction;

      statusSync.subscribe();

      expect(mockOnAction).toHaveBeenCalledTimes(1);
      expect(mockDisposer).not.toHaveBeenCalled();

      statusSync.unsubscribe();

      expect(mockDisposer).toHaveBeenCalledTimes(1);

      (onAction as unknown) = originalOnAction;
    });

    it('безопасно обрабатывает unsubscribe без предварительного subscribe', () => {
      const mockDisposer = jest.fn();
      const originalOnAction = onAction;

      (onAction as jest.Mock) = jest.fn(() => {
        return mockDisposer;
      });

      statusSync.unsubscribe();

      expect(mockDisposer).not.toHaveBeenCalled();

      (onAction as unknown) = originalOnAction;
    });
  });

  describe('Типизация и валидация', () => {
    it('корректно работает с типизированным instance', () => {
      const typedInstance = MockModel.create();
      const typedStatusSync = new StatusSync(typedInstance);

      expect(() => {
        typedStatusSync.subscribe();
        typedStatusSync.unsubscribe();
      }).not.toThrow();
    });
  });

  describe('Проверка очередности вызовов', () => {
    let instanceWithMockedMethods: TInstanceModel<typeof ModelWithMockedMethods>;
    let statusSyncWithMockedMethods: StatusSync<typeof instanceWithMockedMethods>;

    beforeEach(() => {
      instanceWithMockedMethods = ModelWithMockedMethods.create();
      statusSyncWithMockedMethods = new StatusSync(instanceWithMockedMethods);
    });

    afterEach(() => {
      statusSyncWithMockedMethods.unsubscribe();
    });

    it('вызывает setSynced после вызова fill', () => {
      statusSyncWithMockedMethods.subscribe();

      instanceWithMockedMethods.fill();

      expect(mockedFill).toHaveBeenCalledBefore(mockedSetSynced);
      expect(mockedSetSynced).toHaveBeenCalledAfter(mockedFill);
    });
  });
});
