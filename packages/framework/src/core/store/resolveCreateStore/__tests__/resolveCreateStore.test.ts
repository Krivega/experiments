/* eslint-disable @typescript-eslint/unbound-method */
/// <reference types="jest" />
/// <reference types="jest-extended" />
import { resolveCreateStore } from '../index';

import type { IAnyModelType } from 'mobx-state-tree';

describe('resolveCreateStore', () => {
  it('should create a store with the provided initial state', () => {
    const mockModel = {
      create: jest.fn(),
    } as unknown as IAnyModelType; // You might need to adjust the mock to fit your Model's API
    const initialState = {};
    const environment = {};
    const afterCreate = jest.fn();

    const createStore = resolveCreateStore({
      Model: mockModel,
      initialState,
      env: environment,
      afterCreate,
    });

    createStore(); // Call without parameters to use defaults

    expect(mockModel.create).toHaveBeenCalledWith(initialState, expect.anything());
    // Add more expects as needed to test the behavior of the function
  });

  it('should call afterCreateStore if provided', () => {
    const mockModel = {
      create: jest.fn(() => {
        return {};
      }),
    } as unknown as IAnyModelType;
    const afterCreateStore = jest.fn();

    const createStore = resolveCreateStore({
      Model: mockModel,
      afterCreate: afterCreateStore,
    });

    createStore();

    expect(afterCreateStore).toHaveBeenCalled();
  });

  it('should use the savedInitialState when provided', () => {
    const mockModel = {
      create: jest.fn(),
    } as unknown as IAnyModelType;
    const savedInitialState = { someProperty: 'someValue' };

    const createStore = resolveCreateStore({
      Model: mockModel,
      initialState: savedInitialState,
    });

    createStore();

    expect(mockModel.create).toHaveBeenCalledWith(savedInitialState, expect.anything());
  });

  it('should merge environment objects correctly', () => {
    const mockModel = {
      create: jest.fn(),
    } as unknown as IAnyModelType;
    const initialState = {};
    const baseEnvironment = { api: 'baseApi' };
    const extendedEnvironment = { additional: 'extendedEnv' };

    const createStore = resolveCreateStore({
      Model: mockModel,
      initialState,
      env: baseEnvironment,
    });

    createStore({ env: extendedEnvironment });

    expect(mockModel.create).toHaveBeenCalledWith(
      initialState,
      expect.objectContaining({
        ...baseEnvironment,
        ...extendedEnvironment,
      }),
    );
  });

  it('should call afterCreate with the store if provided', () => {
    const mockStore = { someState: 'someValue' };
    const mockModel = {
      create: jest.fn(() => {
        return mockStore;
      }),
    } as unknown as IAnyModelType;
    const afterCreate = jest.fn();
    const initialState = {};

    const createStore = resolveCreateStore({
      Model: mockModel,
      initialState,
    });

    createStore({
      afterCreate,
    });

    expect(afterCreate).toHaveBeenCalledWith(mockStore);
  });
});
