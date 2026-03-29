export type TBaseInstance<P = unknown> = {
  fields: {
    currentState: P;
  };
  canSave: () => boolean;
  setSaveInProgress: () => void;
  setSaveError: () => void;
  rememberState: () => void;
};

export interface ICoreApiSave {
  hideAllNotifications: () => void;
  showSuccessSavingForm: () => void;
  showFailedToSaveFormError: () => void;
}

export interface IServerApiSave<P = unknown, R = void> {
  hasAbortedError: (error: unknown) => boolean;
  setData: (data: P) => { promise: Promise<R>; abort: () => void };
}

export type TDependencies<P, R> = {
  coreApi: ICoreApiSave;
  serverApi: IServerApiSave<P, R>;
};
