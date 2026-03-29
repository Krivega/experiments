/// <reference types="jest" />
import { act, renderHook, waitFor } from '@testing-library/react';

import useAsyncAborted from '..';

const VOID = 0;
const ONE = 1;
const SUCCESS_RESPONSE = 'success';
const FAILED_RESPONSE = 'failed';

const ID_500_ERROR = 'ID_500_ERROR';

type RequestResult<T> = { promise: Promise<T>; abort: () => void };

const createSuccessRequest = (): (() => RequestResult<string>) => {
  return () => {
    const abort = jest.fn();
    const promise = Promise.resolve(SUCCESS_RESPONSE);

    return { promise, abort };
  };
};

const createFailedRequest = (): (() => RequestResult<string>) => {
  return () => {
    const abort = jest.fn();
    const error = new Error(FAILED_RESPONSE) as Error & { id: string };

    error.id = ID_500_ERROR;

    const promise = Promise.reject(error);

    return { promise, abort };
  };
};

describe('useAsyncAborted hook', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should have correct initial state', () => {
    const request = createSuccessRequest();

    const { result } = renderHook(() => {
      return useAsyncAborted(request);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.serverError).toBe(undefined);
    expect(result.current.response).toBe(undefined);
  });

  it('should be in loading true during request and loading false after', async () => {
    const request = createSuccessRequest();

    const { result } = renderHook(() => {
      return useAsyncAborted(request);
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
    const request = createSuccessRequest();

    const { result } = renderHook(() => {
      return useAsyncAborted(request);
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
    const request = createSuccessRequest();
    const onSuccess = jest.fn();
    const onFail = jest.fn();

    const { result } = renderHook(() => {
      return useAsyncAborted(request, { onSuccess, onFail });
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
    const request = createFailedRequest();

    const { result } = renderHook(() => {
      return useAsyncAborted(request);
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
    const request = createFailedRequest();
    const onSuccess = jest.fn();
    const onFail = jest.fn();

    const { result } = renderHook(() => {
      return useAsyncAborted(request, { onSuccess, onFail });
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
    const request = createFailedRequest();

    const { result } = renderHook(() => {
      return useAsyncAborted(request);
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

  it('should call abort on unmount when request is in progress', () => {
    const abort = jest.fn();

    const request = () => {
      const promise = new Promise<string>(() => {});

      return { promise, abort };
    };

    const { result, unmount } = renderHook(() => {
      return useAsyncAborted(request);
    });

    act(() => {
      result.current.run(VOID);
    });

    expect(abort).not.toHaveBeenCalled();

    unmount();

    expect(abort).toHaveBeenCalledTimes(ONE);
  });
});
