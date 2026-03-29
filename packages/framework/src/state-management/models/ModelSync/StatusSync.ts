import { reactions } from '@experiments/mst-tools';

type TInstanceBase = {
  isSyncInProgress: boolean;
  isSyncRetry: boolean;
  setSynced: () => void;
};

class StatusSync<TInstance extends TInstanceBase> {
  private disposers: (() => void)[] = [];

  private readonly instance: TInstance;

  public constructor(instance: TInstance) {
    this.instance = instance;
  }

  public subscribe(): void {
    this.unsubscribe();

    // Реакция на изменение текущего состояния при вызове fill
    const disposer = reactions.onAction(
      this.instance,
      () => {
        if (this.instance.isSyncInProgress || this.instance.isSyncRetry) {
          this.instance.setSynced();
        }
      },
      { actionName: 'fill', isAttachAfter: true },
    );

    this.disposers.push(disposer);
  }

  public unsubscribe(): void {
    this.disposers.forEach((disposer) => {
      disposer();
    });
    this.disposers = [];
  }
}

export default StatusSync;
