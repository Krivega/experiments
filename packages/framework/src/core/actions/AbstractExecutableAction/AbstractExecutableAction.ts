/* eslint-disable @typescript-eslint/class-methods-use-this */

import { debugResolve } from '../../../utils/logger';

import type { IAnyModelType, Instance } from 'mobx-state-tree';
import type { AbstractValidatorAction } from '../AbstractValidatorAction';
import type { TBaseDependencies, TOptions, TParams } from './types';

const noop = () => {};

abstract class AbstractExecutableAction<
  T extends Instance<IAnyModelType> = Instance<IAnyModelType>,
  D extends TBaseDependencies = TBaseDependencies,
  P = void,
  V extends AbstractValidatorAction<T, P> = AbstractValidatorAction<T, P>,
> {
  public validator: V | undefined;

  protected readonly debug = debugResolve(this.constructor.name);

  protected readonly dependencies: D;

  protected readonly instance: T;

  private abortPromise: (() => void) | undefined;

  public constructor({ instance, dependencies }: TParams<T, D>) {
    this.dependencies = dependencies;
    this.instance = instance;
    this.initValidator();
  }

  public static resolveAsyncAction<T, R>(
    syncAction: (params: T) => R,
  ): (params: T) => {
    promise: Promise<R>;
    abort: () => void;
  } {
    return (params: T) => {
      return {
        promise: Promise.resolve(syncAction(params)),
        abort: noop,
      };
    };
  }

  public static resolveAsyncActionNoParams<R>(syncAction: () => R): () => {
    promise: Promise<R>;
    abort: () => void;
  } {
    return () => {
      return {
        promise: Promise.resolve().then(() => {
          return syncAction();
        }),
        abort: noop,
      };
    };
  }

  public execute = (params: P, options?: TOptions<Awaited<ReturnType<this['run']>['promise']>>) => {
    if (!this.canExecute(params)) {
      this.handleErrorValidation();

      return;
    }

    this.beforeRun(params);

    const { promise, abort } = this.run(params);

    this.abortPromise = abort;

    const handleOnSuccess = (response: Awaited<ReturnType<this['run']>['promise']>) => {
      options?.onSuccess?.(response);
    };

    const handleOnError = (error: unknown) => {
      options?.onError?.(error);
    };

    const handleOnFinally = () => {
      options?.onFinally?.();
    };

    promise
      .then((response) => {
        handleOnSuccess(response as Awaited<ReturnType<this['run']>['promise']>);
        this.handleSuccessAction(response as Awaited<ReturnType<this['run']>['promise']>);
      })
      .catch((error: unknown) => {
        this.debug('error', error);
        handleOnError(error);
        this.handleErrorAction(error);
      })
      .finally(() => {
        handleOnFinally();
        this.handleFinallyAction();
      });
  };

  public canExecute = (params: P): boolean => {
    return this.validator?.isValid(params) ?? true;
  };

  public cancel = (): void => {
    this.abortPromise?.();
  };

  protected beforeRun(_params: P): void {}

  protected handleSuccessAction(_response: Awaited<ReturnType<this['run']>['promise']>): void {}

  protected handleFinallyAction(): void {}

  protected handleErrorValidation(): void {}

  protected handleErrorAction(_error: unknown): void {}

  protected initValidator(): void {}

  public abstract run(params: P): {
    promise: Promise<unknown>;
    abort: () => void;
  };
}

export default AbstractExecutableAction;
