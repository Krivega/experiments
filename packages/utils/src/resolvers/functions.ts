/* eslint-disable @typescript-eslint/max-params */
import { noop } from './components';

export const identityCombinator = <T>(value: T): T => {
  return value;
};

export const tapCombinator = <T>(function_: (value: T) => void) => {
  return (value: T) => {
    function_(value);

    return value;
  };
};

export function whenCombinator<T, P>(pred: (value: T) => boolean, function_: (value: T) => P) {
  return (value: T): P | T => {
    return pred(value) ? function_(value) : value;
  };
}

export const whenElseCombinator = <T, P>(
  pred: (value: T) => boolean,
  function1: (value: T) => P,
  function2: (value: T) => P,
) => {
  return (value: T) => {
    return pred(value) ? function1(value) : function2(value);
  };
};

export const unlessCombinator = <T, P>(
  pred: (value?: T) => boolean,
  function_: (value?: T) => P,
) => {
  return (value?: T) => {
    return pred(value) ? value : function_(value);
  };
};

export const altCombinator = <T, P1, P2>(
  function1: (value: T) => P1,
  function2: (value: T) => P2,
) => {
  return (value: T) => {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return function1(value) || function2(value);
  };
};

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const seqCombinator = <T, P>(...funcs: ((value: T) => P)[]) => {
  return (value: T) => {
    funcs.forEach((function_) => {
      return function_(value);
    });
  };
};

export const forkCombinator = <T, P>(
  join: (a: P, b: P) => P,
  function1: (value?: T) => P,
  function2: (value?: T) => P,
) => {
  return (value?: T) => {
    return join(function1(value), function2(value));
  };
};

export const thenResolve = <T, P>(function_: (value: T) => P) => {
  return async (thenable: Promise<T>): Promise<Awaited<P>> => {
    return thenable.then(function_) as Promise<Awaited<P>>;
  };
};

export const catchResolve = <P, T1>(function_: (value: Error) => P) => {
  return async (thenable: Promise<T1>) => {
    return thenable.catch((error: unknown) => {
      return function_(error as Error);
    });
  };
};

export const finallyResolve = <T>(function_: () => void) => {
  return async (thenable: Promise<T>) => {
    return thenable.finally(function_);
  };
};

export const promiseResolve = <T, P>(function_: (value: T) => P) => {
  return async (value: T) => {
    return function_(value);
  };
};

export const identityPromiseResolve = promiseResolve(identityCombinator);

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const promiseReject = <T, P>(function_: (value: T) => P) => {
  return async (value: T) => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw function_(value);
  };
};

export const identityPromiseReject = promiseReject(identityCombinator);

export const resolvePromiseFromPredicate = <T>(predicate: (value: T) => boolean) => {
  return whenElseCombinator(predicate, identityPromiseResolve, identityPromiseReject);
};

export const tapThenCombinator = <T, P>(function_: (value: T) => Promise<P>) => {
  return async (value: T) => {
    return function_(value).then(() => {
      return value;
    });
  };
};

export const tapThenCatchCombinator = <T, P>(function_: (value: T) => Promise<P>) => {
  return async (value: T) => {
    return function_(value)
      .then((): { val: T; isError: boolean } => {
        return { val: value, isError: false };
      })
      .catch((error: unknown): { val: T; error: unknown; isError: boolean } => {
        return { val: value, error, isError: true };
      });
  };
};

export const thenCatchCombinator = <T, P>(
  function_: (value: T) => Promise<P>,
  resolveHandler: (r: P) => P | Promise<P>,
  rejectHandler: (error: Error) => P | Promise<P>,
) => {
  return async (value: T) => {
    return function_(value)
      .then(resolveHandler)
      .catch(async (error: unknown) => {
        return rejectHandler(error as Error);
      });
  };
};

export const combineCombinator = <T, P>(function_: (value: T) => P) => {
  return (value: T) => {
    const valueFunction = function_(value);

    return { val: value, valFunc: valueFunction };
  };
};

export const combineThenCombinator = <T, P>(function_: (value: T) => Promise<P>) => {
  return async (value: T) => {
    return function_(value).then((valueFunction: P) => {
      return { val: value, valFunc: valueFunction };
    });
  };
};

export const deferred = <T>() => {
  let resolveDeferred: (data: T) => void = noop;
  let rejectDeferred: (error: Error) => void = noop;

  const promise = new Promise<T>((resolve, reject) => {
    resolveDeferred = resolve;
    rejectDeferred = reject;
  });

  return { promise, resolve: resolveDeferred, reject: rejectDeferred };
};

export function pipe<A>(): (argument: A) => A;
export function pipe<A, B>(function_: (argument: A) => B): (argument: A) => B;
export function pipe<A, B, C>(
  function0: (argument: A) => B,
  function1: (argument: B) => C,
): (argument: A) => C;
export function pipe<A, B, C, D>(
  function0: (argument: A) => B,
  function1: (argument: B) => C,
  function2: (argument: C) => D,
): (argument: A) => D;
export function pipe<A, B, C, D, E>(
  function0: (argument: A) => B,
  function1: (argument: B) => C,
  function2: (argument: C) => D,
  function3: (argument: D) => E,
): (argument: A) => E;
export function pipe<A, B, C, D, E, F>(
  function0: (argument: A) => B,
  function1: (argument: B) => C,
  function2: (argument: C) => D,
  function3: (argument: D) => E,
  function4: (argument: E) => F,
): (argument: A) => F;
export function pipe<A, B, C, D, E, F, G>(
  function0: (argument: A) => B,
  function1: (argument: B) => C,
  function2: (argument: C) => D,
  function3: (argument: D) => E,
  function4: (argument: E) => F,
  function5: (argument: F) => G,
): (argument: A) => G;
export function pipe<A, B, C, D, E, F, G, H>(
  function0: (argument: A) => B,
  function1: (argument: B) => C,
  function2: (argument: C) => D,
  function3: (argument: D) => E,
  function4: (argument: E) => F,
  function5: (argument: F) => G,
  function6: (argument: G) => H,
): (argument: A) => H;
export function pipe<A, B, C, D, E, F, G, H, I>(
  function0: (argument: A) => B,
  function1: (argument: B) => C,
  function2: (argument: C) => D,
  function3: (argument: D) => E,
  function4: (argument: E) => F,
  function5: (argument: F) => G,
  function6: (argument: G) => H,
  function7: (argument: H) => I,
): (argument: A) => I;

export function pipe<R>(...callbacks: ((parameters: R) => R)[]): (parameters: R) => R {
  return (initial: R) => {
    return callbacks.reduce((argument, function_) => {
      return function_(argument);
    }, initial);
  };
}
