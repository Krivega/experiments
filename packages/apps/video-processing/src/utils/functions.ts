/**
 * A function that does nothing but return the parameter supplied to it. Good
 * as a default or placeholder function.
 *
 * @func
 * @category Function
 * @sig a -> a
 * @param {*} val The value to return.
 * @return {*} The input value, `val`.
 * @example
 *
 *      identityCombinator(1); //=> 1
 *
 *      const obj = {};
 *      identityCombinator(obj) === obj; //=> true
 * @symb identityCombinator(a) = a
 */
export const identityCombinator = (val) => {
  return val;
};

export const tapCombinator = (func) => {
  return (val) => {
    func(val);

    return val;
  };
};

export const whenCombinator = <T>(pred, func) => {
  return (...args: T[]) => {
    return pred(...args) ? func(...args) : args;
  };
};

export const whenElseCombinator = <T>(pred, func1, fun2) => {
  return (val?: T) => {
    return pred(val) ? func1(val) : fun2(val);
  };
};

export const unlessCombinator = (pred, func) => {
  return (val?: any) => {
    return pred(val) ? val : func(val);
  };
};

export const altCombinator = (func1, func2) => {
  return (val?: any) => {
    return func1(val) || func2(val);
  };
};

/**
 * seqCombinator
 * @param {array} funcs funcs
 * @returns {function} seqCombinator
 */
export const seqCombinator = (...funcs) => {
  return (val) => {
    return funcs.forEach((func) => {
      return func(val);
    });
  };
};
/**
 * forkCombinator
 * @param {function} join join
 * @param {function} func1 func1
 * @param {function} func2 func2
 * @returns {function} forkCombinator
 */
export const forkCombinator = (join, func1, func2) => {
  return (val) => {
    return join(func1(val), func2(val));
  };
};

export const thenResolve = (func) => {
  return (thenable) => {
    return thenable.then(func);
  };
};

export const catchResolve = (func) => {
  return (promise) => {
    return promise.catch(func);
  };
};

export const finallyResolve = (func) => {
  return (promise) => {
    return promise.finally(func);
  };
};

export const promiseResolve = (func) => {
  return (val) => {
    return Promise.resolve(func(val));
  };
};

/**
 * identityPromiseResolve
 * @returns {Promise} resolved promise
 */
export const identityPromiseResolve = promiseResolve(identityCombinator);

export const promiseReject = (func) => {
  return (val) => {
    return Promise.reject(func(val));
  };
};

/**
 * identityPromiseReject
 * @returns {Promise} rejected promise
 */
export const identityPromiseReject = promiseReject(identityCombinator);

// eslint-disable-next-line valid-jsdoc
/**
 *  resolved promise if predicate returns true or rejected if false
 */
export const resolvePromiseFromPredicate = (predicate) => {
  return whenElseCombinator(predicate, identityPromiseResolve, identityPromiseReject);
};

export const tapThenCombinator = (func) => {
  return (val) => {
    return func(val).then(() => {
      return val;
    });
  };
};

export const tapThenCatchCombinator = <T>(func) => {
  return (val: T) => {
    return func(val)
      .then((): { val: T; isError: boolean } => {
        return { val, isError: false };
      })
      .catch((error: Error): { val: T; error: Error; isError: boolean } => {
        return { val, error, isError: true };
      });
  };
};

export const thenCatchCombinator = <T, P>(
  func,
  resolveHandler: (any) => Promise<P> | P,
  rejectHandler: (error: Error) => Promise<P> | P
) => {
  return (val: T): Promise<P> => {
    return func(val).then(resolveHandler).catch(rejectHandler);
  };
};

/**
 * Combine recived val and val of function to Tuple ({ val, valFunc })
 *
 * @func
 * @category Function
 * @param {function} func - The function to call with `val`. The return value of `func` will be exec away.
 * @returns {Object} Tuple - ({ val, valFunc })
 * @example
 *
 *      const getX = x => ('x is ' + x);
 *      combineCombinator(getX)(100); //=> ({ val:100, valFunc: 'x is 100' })
 */
export const combineCombinator = (func) => {
  return (val) => {
    const valFunc = func(val);

    return { val, valFunc };
  };
};

export const combineThenCombinator = (func) => {
  return (val) => {
    return func(val).then((valFunc) => {
      return { val, valFunc };
    });
  };
};

/**
 * Combine recived val and then of function to Tuple ({ val, valFunc })
 *
 * @func
 * @category Function
 * @param {function} func - The function to call with `val`. The return value of `func` will be then away.
 * @returns {Promise} Tuple - ({ val, valFunc })
 * @example
 *
 *      const getX = x => Promise.resolve('x is ' + x);
 *      combineThenCombinator(getX)(100); //=> ({ val:100, valFunc: 'x is 100' })
 */
