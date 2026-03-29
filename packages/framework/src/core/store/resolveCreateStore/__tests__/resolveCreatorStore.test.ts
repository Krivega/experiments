/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/// <reference types="jest" />
/// <reference types="jest-extended" />
import { resolveCreatorStore } from '../index';

import type { TActions, TActionsWrapped, TStoreAll } from '../types';

type TCreatorStoreResult = {
  wrappedStore: Record<string, unknown>;
  createActions: (stores: TStoreAll, actions: TActions) => TActionsWrapped;
};

const createStoreMock = (
  storeName: string,
): [store: TCreatorStoreResult, createActionsMock: jest.Mock] => {
  const createStoreFactory = () => {
    return jest.fn(() => {
      return {};
    });
  };
  const createActionsMock = jest.fn().mockImplementation(() => {
    return {
      action: jest.fn(),
    };
  });
  const store = resolveCreatorStore(createStoreFactory())(
    storeName,
    {},
    { runReactions: jest.fn(), afterAllCreate: jest.fn(), createActions: createActionsMock },
  )({}) as TCreatorStoreResult;

  return [store, createActionsMock];
};

describe('resolveCreatorStore', () => {
  it('должен создавать стор с заданным именем когда передан storeName и options', () => {
    const mockStoreName = 'testStore';
    const mockCreateStore = jest.fn(() => {
      return {};
    });
    const mockOptions = {};
    const mockRunnerOptions = {
      runReactions: jest.fn(),
      afterAllCreate: jest.fn(),
      createActions: jest.fn(),
    };
    const creatorStore = resolveCreatorStore(mockCreateStore);
    const result = creatorStore(mockStoreName, mockOptions, mockRunnerOptions);
    const store = result({});

    expect(store).toHaveProperty('wrappedStore');
    expect(store.wrappedStore).toHaveProperty(mockStoreName);
    expect(typeof store.runReactions).toBe('function');
    expect(typeof store.afterAllCreate).toBe('function');
    expect(typeof store.createActions).toBe('function');
  });

  it('должен не создавать wrappedStore когда hasAvailable возвращает false', () => {
    const mockStoreName = 'testStore';
    const mockCreateStore = jest.fn();
    const mockOptions = {};
    const mockRunnerOptions = {
      runReactions: jest.fn(),
      afterAllCreate: jest.fn(),
      createActions: jest.fn(),
    };
    const hasAvailable = jest.fn().mockReturnValue(false);
    const creatorStore = resolveCreatorStore(mockCreateStore);
    const store = creatorStore(mockStoreName, mockOptions, mockRunnerOptions, hasAvailable)({});

    expect(store.wrappedStore[mockStoreName]).toBeNull();
    expect(hasAvailable).toHaveBeenCalled();
    expect(typeof store.createActions).toBe('function');
    expect(store.createActions(store.wrappedStore, {})).toEqual({ [mockStoreName]: {} });
  });

  it('должен вызывать runReactions и afterAllCreate когда hasAvailable возвращает true', () => {
    const mockStoreName = 'testStore';
    const mockCreateStore = jest.fn();
    const runReactionsMock = jest.fn();
    const afterAllCreateMock = jest.fn();
    const createActionsMock = jest.fn();
    const hasAvailable = jest.fn().mockReturnValue(true);
    const mockOptions = {};
    const mockRunnerOptions = {
      runReactions: runReactionsMock,
      afterAllCreate: afterAllCreateMock,
      createActions: createActionsMock,
    };
    const creatorStore = resolveCreatorStore(mockCreateStore);
    const actions = {};
    const store = creatorStore(
      mockStoreName,
      mockOptions,
      mockRunnerOptions,
      hasAvailable,
    )(actions);

    store.runReactions(store.wrappedStore, actions);
    store.afterAllCreate(store.wrappedStore, actions);

    expect(runReactionsMock).toHaveBeenCalledWith(store.wrappedStore, actions);
    expect(afterAllCreateMock).toHaveBeenCalledWith(store.wrappedStore, actions);
    expect(hasAvailable).toHaveBeenCalledTimes(3);
  });

  it('должен передавать объект со всеми экшенами вторым параметром при вызове createActions', () => {
    const [firstStore, firstCreateActionsMock] = createStoreMock('first');
    const [secondStore, secondCreateActionsMock] = createStoreMock('second');
    const [thirdStore, thirdCreateActionsMock] = createStoreMock('third');

    const storeCreators = [firstStore, secondStore, thirdStore];

    const allStores = {};

    for (const store of storeCreators) {
      Object.assign(allStores, store.wrappedStore);
    }

    const allActions = {};

    for (const store of storeCreators) {
      Object.assign(allActions, store.createActions(allStores, allActions));
    }

    const expectedActions = {
      first: {
        action: expect.any(Function),
      },
      second: {
        action: expect.any(Function),
      },
      third: {
        action: expect.any(Function),
      },
    };

    expect(firstCreateActionsMock).toHaveBeenLastCalledWith(allStores, expectedActions);
    expect(secondCreateActionsMock).toHaveBeenLastCalledWith(allStores, expectedActions);
    expect(thirdCreateActionsMock).toHaveBeenLastCalledWith(allStores, expectedActions);
  });

  it('должен использовать реализации по умолчанию для afterAllCreate и createActions когда они не переданы', () => {
    const mockStoreName = 'testStore';
    const mockCreateStore = jest.fn();
    const runReactionsMock = jest.fn();
    const hasAvailable = jest.fn().mockReturnValue(true);
    const mockOptions = {};
    const mockRunnerOptions = {
      runReactions: runReactionsMock,
    };
    const creatorStore = resolveCreatorStore(mockCreateStore);
    const actions = {};
    const store = creatorStore(
      mockStoreName,
      mockOptions,
      mockRunnerOptions,
      hasAvailable,
    )(actions);

    expect(typeof store.afterAllCreate).toBe('function');
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(store.afterAllCreate(store.wrappedStore, actions)).toBeUndefined();

    expect(typeof store.createActions).toBe('function');
    expect(store.createActions(store.wrappedStore, {})).toEqual({ [mockStoreName]: {} });
  });

  it('должен вызывать getEnv и передавать возвращённое значение в createStore когда передан getEnv в options', () => {
    const mockStoreName = 'testStore';
    const mockCreateStore = jest.fn();
    const mockEnvironment = { someKey: 'someValue' };
    const getEnvironmentMock = jest.fn().mockReturnValue(mockEnvironment);
    const mockOptions = { getEnv: getEnvironmentMock };
    const mockRunnerOptions = {
      runReactions: jest.fn(),
      afterAllCreate: jest.fn(),
      createActions: jest.fn(),
    };
    const actions = {};
    const creatorStore = resolveCreatorStore(mockCreateStore);

    creatorStore(mockStoreName, mockOptions, mockRunnerOptions)(actions);

    expect(getEnvironmentMock).toHaveBeenCalled();
    expect(mockCreateStore).toHaveBeenCalledWith(
      expect.objectContaining({
        env: mockEnvironment,
      }),
    );
  });

  it('должен не вызывать runReactions когда hasAvailable возвращает false', () => {
    const mockStoreName = 'testStore';
    const mockCreateStore = jest.fn();
    const runReactionsMock = jest.fn();
    const hasAvailable = jest.fn().mockReturnValue(false);
    const mockOptions = {};
    const mockRunnerOptions = {
      runReactions: runReactionsMock,
    };
    const creatorStore = resolveCreatorStore(mockCreateStore);
    const actions = {};
    const store = creatorStore(
      mockStoreName,
      mockOptions,
      mockRunnerOptions,
      hasAvailable,
    )(actions);

    store.runReactions(store.wrappedStore, actions);

    expect(runReactionsMock).not.toHaveBeenCalled();
  });

  it('должен не вызывать afterAllCreate когда hasAvailable возвращает false', () => {
    const mockStoreName = 'testStore';
    const mockCreateStore = jest.fn();
    const afterAllCreateMock = jest.fn();
    const hasAvailable = jest.fn().mockReturnValue(false);
    const mockOptions = {};
    const mockRunnerOptions = {
      runReactions: jest.fn(),
      afterAllCreate: afterAllCreateMock,
    };
    const creatorStore = resolveCreatorStore(mockCreateStore);
    const actions = {};
    const store = creatorStore(
      mockStoreName,
      mockOptions,
      mockRunnerOptions,
      hasAvailable,
    )(actions);

    store.afterAllCreate(store.wrappedStore, actions);

    expect(afterAllCreateMock).not.toHaveBeenCalled();
  });
});
