import type { TApiMethod } from './types';

type TProps<TResponse> = {
  hideConfirmation: () => void;
  showConfirmation: () => Promise<void>;
  request: () => TApiMethod<TResponse>;
};

class RequestWithConfirmation<TResponse> {
  private readonly showConfirmation: () => Promise<void>;

  private readonly request: () => TApiMethod<TResponse>;

  private hideConfirmation: (() => void) | undefined;

  private abortRequest: (() => void) | undefined;

  public constructor({ hideConfirmation, showConfirmation, request }: TProps<TResponse>) {
    this.hideConfirmation = hideConfirmation;
    this.showConfirmation = showConfirmation;
    this.request = request;
  }

  public execute = (): TApiMethod<TResponse> => {
    const promise = this.showConfirmation()
      .finally(() => {
        this.hideConfirmation = undefined;
      })
      .then(async () => {
        const { abort, promise: requestPromise } = this.request();

        this.abortRequest = abort;

        return requestPromise;
      })
      .finally(() => {
        this.abortRequest = undefined;
      });

    return {
      promise,
      abort: this.abort,
    };
  };

  private readonly abort = (): void => {
    this.hideConfirmation?.();
    this.abortRequest?.();
  };
}

export default RequestWithConfirmation;
