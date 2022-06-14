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
export const identityCombinator = (val) => val;

/**
 * Runs the given function with the supplied object, then returns the object.
 *
 * @func
 * @category Function
 * @sig (a -> *) -> a -> a
 * @param {Function} func The function to call with `val`. The return value of `func` will be thrown away.
 * @param {*} val The value to return.
 * @return {*} The input value, `val`.
 * @example
 *
 *      const sayX = x => console.log('x is ' + x);
 *      tapCombinator(sayX, 100); //=> 100
 *      // logs 'x is 100'
 * @symb tapCombinator(f, a) = a
 */
export const tapCombinator = (func) => (val) => {
  func(val);

  return val;
};

export const whenCombinator = (pred, func) => (val) => (pred(val) ? func(val) : val);

export const whenElseCombinator = (pred, func1, fun2) => (val) =>
  pred(val) ? func1(val) : fun2(val);

export const unlessCombinator = (pred, func) => (val) => (pred(val) ? val : func(val));

/**
 * altCombinator
 * @param {function} func1 func1
 * @param {function} func2 func2
 * @returns {function} altCombinator
 */
export const altCombinator = (func1, func2) => (val) => func1(val) || func2(val);

/**
 * seqCombinator
 * @param {array} funcs funcs
 * @returns {function} seqCombinator
 */
export const seqCombinator = (...funcs) => (val) => funcs.forEach((func) => func(val));
/**
 * forkCombinator
 * @param {function} join join
 * @param {function} func1 func1
 * @param {function} func2 func2
 * @returns {function} forkCombinator
 */
export const forkCombinator = (join, func1, func2) => (val) => join(func1(val), func2(val));

/**
 * thenResolve
 * @param {function} func func
 * @returns {Promise} thenResolve
 */
export const thenResolve = (func) => (thenable) => thenable.then(func);

/**
 * catchResolve
 * @param {function} func func
 * @returns {Promise} catchResolve
 */
export const catchResolve = (func) => (promise) => promise.catch(func);

/**
 * finallyResolve
 * @param {function} func func
 * @returns {Promise} finallyResolve
 */
export const finallyResolve = (func) => (promise) => promise.finally(func);

/**
 * promiseResolve
 * @param {function} func func
 * @returns {Promise} promiseResolve
 */
export const promiseResolve = (func) => (val) => Promise.resolve(func(val));

/**
 * identityPromiseResolve
 * @returns {Promise} resolved promise
 */
export const identityPromiseResolve = promiseResolve(identityCombinator);

/**
 * promiseReject
 * @param {function} func func
 * @returns {Promise} promiseReject
 */
export const promiseReject = (func) => (val) => Promise.reject(func(val));

/**
 * identityPromiseReject
 * @returns {Promise} rejected promise
 */
export const identityPromiseReject = promiseReject(identityCombinator);

/**
 * resolvePromiseFromPredicate
 * @param {function} predicate func
 * @returns {Promise} resolved promise if predicate returns true or rejected if false
 */
export const resolvePromiseFromPredicate = (predicate) =>
  whenElseCombinator(predicate, identityPromiseResolve, identityPromiseReject);

/**
 * tapThenCombinator
 * @param {function} func func
 * @returns {Promise} tapThenCombinator
 */
export const tapThenCombinator = (func) => (val) => func(val).then(() => val);

/**
 * tapThenCatchCombinator
 * @param {function} func func
 * @returns {Promise} tapThenCatchCombinator
 */
export const tapThenCatchCombinator = (func) => (val) =>
  func(val)
    .then(() => ({ val, error: false }))
    .catch(() => ({ val, error: true }));

/**
 * thenCatchCombinator
 * @param {function} func func
 * @param {function} resolveHandler func
 * @param {function} rejectHandler func
 * @returns {Promise} thenCatchCombinator
 */
export const thenCatchCombinator = (func, resolveHandler, rejectHandler) => (val) =>
  func(val).then(resolveHandler).catch(rejectHandler);

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
export const combineCombinator = (func) => (val) => {
  const valFunc = func(val);

  return { val, valFunc };
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
export const combineThenCombinator = (func) => (val) =>
  func(val).then((valFunc) => ({ val, valFunc }));
