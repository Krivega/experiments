import { AbstractExecutableAction } from '../../../actions';

import type { TStoreDependencies } from './storeDependencies';
import type { TInstanceTodo } from './TodoModel';
import type { TParams } from './types';

class UpdateTitleAction extends AbstractExecutableAction<
  TInstanceTodo,
  TStoreDependencies,
  TParams
> {
  public run(newTitle: TParams) {
    return AbstractExecutableAction.resolveAsyncAction(this.updateTitle)(newTitle);
  }

  private readonly updateTitle = (title: TParams): void => {
    this.instance.setTitle(title);
  };
}

export default UpdateTitleAction;
