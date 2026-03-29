import { resolveSetter } from '@experiments/mst-tools';
import { types as typesMST } from 'mobx-state-tree';

import { decodeUriExceptSpace } from '../../../../../shared/parsers';
import { parseMessageText } from '../../../../../shared/voteEncoding';

import type { TInitialState, TInstanceModel } from '@experiments/mst-tools';
import type { TMessageMeta } from '../types';

const Model = typesMST
  .model({
    id: typesMST.identifier,
    my: typesMST.boolean,
    text: typesMST.string,
    timestamp: typesMST.number,
    title: typesMST.string,
    isRead: typesMST.optional(typesMST.boolean, false),
  })
  .views((self) => {
    return {
      get isDeletable() {
        return self.my;
      },
      get parsedMessage() {
        const { id, text, title, timestamp, isRead, my } = self;
        const { isDeletable } = this;

        const parsed = parseMessageText(text);
        const meta: TMessageMeta = {
          id,
          timestamp,
          isDeletable,
          isRead,
          isMy: my,
          author: title,
        };

        if (parsed.type === 'plain') {
          const decoded = decodeUriExceptSpace(text);

          return { ...parsed, ...meta, text: decoded };
        }

        return { ...parsed, ...meta };
      },
    };
  })
  .actions((self) => {
    const resolveSelfSetter = resolveSetter(self);
    const setIsRead = resolveSelfSetter('isRead');

    const markAsRead = () => {
      setIsRead(true);
    };

    return {
      markAsRead,
    };
  });

export type TInstance = TInstanceModel<typeof Model>;
export type TInitialStateMessage = TInitialState<typeof Model>;

export default Model;
