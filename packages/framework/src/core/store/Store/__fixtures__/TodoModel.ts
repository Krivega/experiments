import { resolveSetter } from '@experiments/mst-tools';
import { types } from 'mobx-state-tree';

import type { Instance } from 'mobx-state-tree';

const TodoModel = types
  .model({
    title: types.string,
    done: types.boolean,
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setDone = resolveSelfSetter('done');
    const setTitle = resolveSelfSetter('title');

    return {
      toggle() {
        setDone(!self.done);
      },
      setTitle(newTitle: string) {
        setTitle(newTitle);
      },
    };
  });

export type TInstanceTodo = Instance<typeof TodoModel>;

export default TodoModel;
