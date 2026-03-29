interface ICoreApiActionBase {
  hideAllNotifications: () => void;
}

export interface ICoreApiAction {
  showSuccessAction?: () => void;
  showErrorAction: () => void;
}

type TCoreApi = ICoreApiAction & ICoreApiActionBase;

export interface IServerApiAction<P, R> {
  hasAbortedError: (error: unknown) => boolean;
  request: (data: P) => {
    promise: Promise<R>;
    abort: () => void;
  };
}

export type TDependencies<P, R> = {
  coreApi: TCoreApi;
  serverApi: IServerApiAction<P, R>;
};

export type TBaseInstance = {
  isActionInProgress: boolean;
  startAction: () => void;
  endAction: () => void;
};
