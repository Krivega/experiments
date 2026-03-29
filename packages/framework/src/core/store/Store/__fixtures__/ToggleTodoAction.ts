import { AbstractExecutableAction } from '../../../actions';

import type { TStoreDependencies } from './storeDependencies';
import type { TInstanceTodo } from './TodoModel';

class ToggleTodoAction extends AbstractExecutableAction<TInstanceTodo, TStoreDependencies> {
  public run() {
    return AbstractExecutableAction.resolveAsyncActionNoParams(this.toggleTodo)();
  }

  private readonly toggleTodo = (): boolean => {
    this.instance.toggle();

    return this.instance.done;
  };
}

export default ToggleTodoAction;
