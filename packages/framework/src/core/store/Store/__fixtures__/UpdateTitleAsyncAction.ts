import { AbstractExecutableAction } from '../../../actions';

import type { TStoreDependencies } from './storeDependencies';
import type { TInstanceTodo } from './TodoModel';
import type { TParams } from './types';

class UpdateTitleAsyncAction extends AbstractExecutableAction<
  TInstanceTodo,
  TStoreDependencies,
  TParams
> {
  public run(newTitle: TParams) {
    return AbstractExecutableAction.resolveAsyncAction(this.updateTitle)(newTitle);
  }

  private readonly updateTitle = async (title: TParams): Promise<void> => {
    return Promise.resolve().then(() => {
      this.instance.setTitle(title);
    });
  };
}

export default UpdateTitleAsyncAction;
