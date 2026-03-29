import { debugResolve } from '../../../utils/logger';

export interface ISaveFormInstance {
  setSaveInProgress: () => void;
  setSaveError: () => void;
  rememberState: () => void;
  fields: {
    currentState: unknown;
  };
}

export interface ICoreApiSave {
  hideAllNotifications: () => void;
  showSuccessSavingForm: () => void;
  showFailedToSaveFormError: () => void;
}

export interface IServerApiSave<TData = unknown, TResponse = void> {
  hasAbortedError: (error: unknown) => boolean;
  setData: (data: TData) => { promise: Promise<TResponse>; abort: () => void };
}

export type TSaveParams<TResponse = void> = {
  onSuccess?: (response: TResponse) => void;
};

/**
 * The base class for saving form.
 *
 * @deprecated Use the new class `BaseSaveForm` base class instead.
 */
export abstract class BaseSaveFormDeprecated<
  TData = unknown,
  TResponse = void,
  TInstance extends ISaveFormInstance = ISaveFormInstance,
  TServerApi extends IServerApiSave<TData, TResponse> = IServerApiSave<TData, TResponse>,
  TCoreApi extends ICoreApiSave = ICoreApiSave,
> {
  protected readonly debug: ReturnType<typeof debugResolve>;

  protected readonly coreApi: TCoreApi;

  protected readonly serverApi: TServerApi;

  protected instance: TInstance;

  public constructor({
    instance,
    coreApi,
    serverApi,
    debugNamespace,
  }: {
    instance: TInstance;
    coreApi: TCoreApi;
    serverApi: TServerApi;
    debugNamespace: string;
  }) {
    this.instance = instance;
    this.coreApi = coreApi;
    this.serverApi = serverApi;
    this.debug = debugResolve(debugNamespace);
  }

  public save(saveParams?: TSaveParams<TResponse>): () => void {
    this.handleStart();

    const data = this.getSaveData();
    const { promise, abort } = this.callServerApi(data);

    promise
      .then((response: TResponse) => {
        saveParams?.onSuccess?.(response);
        this.handleSuccess();
      })
      .catch((error: unknown) => {
        this.handleError(error);
      });

    return abort;
  }

  public saveAction(saveParams?: TSaveParams<TResponse>): {
    abort: () => void;
  } {
    const abort = this.save(saveParams);

    return { abort };
  }

  protected handleStart(): void {
    this.coreApi.hideAllNotifications();
    this.instance.setSaveInProgress();
  }

  protected handleSuccess(): void {
    this.coreApi.showSuccessSavingForm();
    this.instance.rememberState();
  }

  protected handleError(error: unknown): void {
    this.debug('error', error);

    if (!this.serverApi.hasAbortedError(error)) {
      this.coreApi.showFailedToSaveFormError();
    }

    this.instance.setSaveError();
  }

  protected callServerApi(data: TData): { promise: Promise<TResponse>; abort: () => void } {
    return this.serverApi.setData(data);
  }

  protected getSaveData(): TData {
    return this.instance.fields.currentState as TData;
  }
}
