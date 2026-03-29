import { requestToApiMethod } from '@/shared/serverApi';

type TState = {
  failRequests: boolean;
  abortedRequests: boolean;
  unauthorizedRequests: boolean;
};

export class ServerApi {
  private readonly state: TState;

  public constructor(params?: Partial<TState>) {
    this.state = {
      failRequests: params?.failRequests ?? false,
      abortedRequests: params?.abortedRequests ?? false,
      unauthorizedRequests: params?.unauthorizedRequests ?? false,
    };
  }

  private get isFailRequests(): boolean {
    return this.state.failRequests || this.state.abortedRequests || this.state.unauthorizedRequests;
  }

  public hasAbortedError = (): boolean => {
    return this.state.abortedRequests;
  };

  public hasUnauthorizedError = (): boolean => {
    return this.state.unauthorizedRequests;
  };

  public request = () => {
    return requestToApiMethod(async () => {
      if (this.isFailRequests) {
        throw new Error('request error');
      }
    });
  };

  public doAbortRequests(): void {
    this.state.abortedRequests = true;
  }

  public doFailRequests(): void {
    this.state.failRequests = true;
  }

  public doUnauthorizedRequests(): void {
    this.state.unauthorizedRequests = true;
  }

  public reset(): void {
    this.state.failRequests = false;
    this.state.abortedRequests = false;
    this.state.unauthorizedRequests = false;
  }
}
