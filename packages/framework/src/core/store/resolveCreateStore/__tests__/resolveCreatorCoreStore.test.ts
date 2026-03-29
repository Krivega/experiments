/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/// <reference types="jest" />
/// <reference types="jest-extended" />
import { resolveCreatorCoreStore } from '../index';

describe('resolveCreatorCoreStore', () => {
  it('should return the correct structure', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);

    const result = creator('testStore', {}, { runReactions: jest.fn() })();

    expect(result).toEqual({
      wrappedStore: { testStore: undefined },
      runReactions: expect.any(Function),
      afterAllCreate: expect.any(Function),
      createActions: expect.any(Function),
    });
  });

  it('should call createStore with correct options when hasAvailable is true', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);

    const hasAvailableMock = jest.fn().mockReturnValue(true);

    creator('testStore', {}, { runReactions: jest.fn() }, hasAvailableMock)();

    expect(createMock).toHaveBeenCalledWith({});
  });

  it('should call createActions with correct arguments when hasAvailable is true', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);

    const hasAvailableMock = jest.fn().mockReturnValue(true);
    const createActionsMock = jest.fn();

    const result = creator(
      'testStore',
      {},
      { runReactions: jest.fn(), createActions: createActionsMock },
      hasAvailableMock,
    )();

    result.createActions(result.wrappedStore, {});

    expect(createActionsMock).toHaveBeenCalledWith(result.wrappedStore, {});
  });

  it('should call runReactions with correct arguments when hasAvailable is true', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);

    const hasAvailableMock = jest.fn().mockReturnValue(true);
    const runReactionsMock = jest.fn();

    const result = creator('testStore', {}, { runReactions: runReactionsMock }, hasAvailableMock)();

    result.runReactions(result.wrappedStore, {});

    expect(runReactionsMock).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
  });

  it('should call afterAllCreate with correct arguments when hasAvailable is true', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);

    const hasAvailableMock = jest.fn().mockReturnValue(true);
    const afterAllCreateMock = jest.fn();

    const result = creator(
      'testStore',
      {},
      { runReactions: jest.fn(), afterAllCreate: afterAllCreateMock },
      hasAvailableMock,
    )();

    result.afterAllCreate(result.wrappedStore, {});

    expect(afterAllCreateMock).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
  });

  it('should use a no-op afterAllCreate by default when not provided', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);

    const hasAvailableMock = jest.fn().mockReturnValue(true);

    const result = creator(
      'testStore',
      {},
      { runReactions: jest.fn() }, // Notice afterAllCreate is not provided
      hasAvailableMock,
    )();

    // Check if afterAllCreate is a function and does not throw when called
    expect(typeof result.afterAllCreate).toBe('function');

    // Call the afterAllCreate to see if it behaves as a no-op
    expect(() => {
      result.afterAllCreate(result.wrappedStore, {});
    }).not.toThrow();
  });

  it('should use default createActions when not provided', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);

    const hasAvailableMock = jest.fn().mockReturnValue(true);

    const result = creator(
      'testStore',
      {},
      { runReactions: jest.fn(), afterAllCreate: jest.fn() }, // createActions is not provided
      hasAvailableMock,
    )();

    // Check if createActions is a function
    expect(typeof result.createActions).toBe('function');

    // Call the createActions to see what it returns by default
    const defaultActions = result.createActions({}, {});

    expect(defaultActions).toEqual({ testStore: {} });
  });

  it('should not call createActions or afterAllCreate when hasAvailable returns false', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);

    const hasAvailableMock = jest.fn().mockReturnValue(false);
    const createActionsMock = jest.fn();
    const afterAllCreateMock = jest.fn();

    creator(
      'testStore',
      {},
      {
        runReactions: jest.fn(),
        createActions: createActionsMock,
        afterAllCreate: afterAllCreateMock,
      },
      hasAvailableMock,
    )();

    expect(createActionsMock).not.toHaveBeenCalled();
    expect(afterAllCreateMock).not.toHaveBeenCalled();
  });

  it('should not call createActions when hasAvailable returns false', () => {
    // Setup the mock functions
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);
    const hasAvailableMock = jest.fn().mockReturnValue(false);
    const createActionsMock = jest.fn();

    // Call the creator function with the mocked hasAvailable function
    const result = creator(
      'testStore',
      {},
      { runReactions: jest.fn(), createActions: createActionsMock },
      hasAvailableMock,
    )();

    const defaultActions = result.createActions({}, {});

    expect(defaultActions).toEqual({ testStore: {} });
    expect(createActionsMock).not.toHaveBeenCalled();
  });

  it('should not call runReactions when hasAvailable returns false', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);
    const hasAvailableMock = jest.fn().mockReturnValue(false);
    const runReactionsMock = jest.fn();

    const result = creator('testStore', {}, { runReactions: runReactionsMock }, hasAvailableMock)();

    result.runReactions(result.wrappedStore, {});

    expect(runReactionsMock).not.toHaveBeenCalled();
  });

  it('should not call afterAllCreate when hasAvailable returns false', () => {
    const createMock = jest.fn();
    const creator = resolveCreatorCoreStore(createMock);
    const hasAvailableMock = jest.fn().mockReturnValue(false);
    const afterAllCreateMock = jest.fn();

    const result = creator(
      'testStore',
      {},
      { runReactions: jest.fn(), afterAllCreate: afterAllCreateMock },
      hasAvailableMock,
    )();

    result.afterAllCreate(result.wrappedStore, {});

    expect(afterAllCreateMock).not.toHaveBeenCalled();
  });
});
