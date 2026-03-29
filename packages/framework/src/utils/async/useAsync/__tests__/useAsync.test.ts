/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react';

import useAsync from '..';

const VOID = 0;
const ONE = 1;
const SUCCESS_RESPONSE = 'success';
const FAILED_RESPONSE = 'failed';

const ID_500_ERROR = 'ID_500_ERROR';

const requestSuccess = async () => {
  return SUCCESS_RESPONSE;
};

const requestFail = async () => {
  const error = new Error(FAILED_RESPONSE) as Error & { id: string };

  error.id = ID_500_ERROR;

  throw error;
};

describe('useAsync hook', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => {
      return useAsync(requestSuccess);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.serverError).toBe(undefined);
    expect(result.current.response).toBe(undefined);
  });

  it('should be in loading true during request and loading false after', async () => {
    const { result } = renderHook(() => {
      return useAsync(requestSuccess);
    });

    act(() => {
      result.current.run(VOID);
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should have correct response and no error after successful response', async () => {
    const { result } = renderHook(() => {
      return useAsync(requestSuccess);
    });

    act(() => {
      result.current.run(VOID);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.response).toBe(SUCCESS_RESPONSE);
    expect(result.current.serverError).toBe(undefined);
  });

  it('should call onSuccess callback after successful response', async () => {
    const onSuccess = jest.fn();
    const onFail = jest.fn();

    const { result } = renderHook(() => {
      return useAsync(requestSuccess, { onSuccess, onFail });
    });

    act(() => {
      result.current.run(VOID);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(ONE);
      expect(onSuccess).toHaveBeenCalledWith(SUCCESS_RESPONSE);
      expect(onFail).toHaveBeenCalledTimes(VOID);
    });
  });

  it('should have correct error and response undefined after failed response', async () => {
    const { result } = renderHook(() => {
      return useAsync(requestFail);
    });

    act(() => {
      result.current.run(VOID);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.response).toBe(undefined);
    expect(result.current.serverError).toBe(ID_500_ERROR);
  });

  it('should call onFail callback after failed response', async () => {
    const onSuccess = jest.fn();
    const onFail = jest.fn();

    const { result } = renderHook(() => {
      return useAsync(requestFail, { onSuccess, onFail });
    });

    act(() => {
      result.current.run(VOID);
    });

    await waitFor(() => {
      expect(onFail).toHaveBeenCalledTimes(ONE);
      expect(onFail).toHaveBeenCalledWith(ID_500_ERROR);
      expect(onSuccess).toHaveBeenCalledTimes(VOID);
    });
  });

  it('should reset error after failed request on resetCurrentState', async () => {
    const { result } = renderHook(() => {
      return useAsync(requestFail);
    });

    act(() => {
      result.current.run(VOID);
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.serverError).toBe(ID_500_ERROR);

    result.current.resetCurrentState();

    await waitFor(() => {
      expect(result.current.serverError).toBe(undefined);
    });
  });
});
