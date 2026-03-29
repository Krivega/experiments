import { BaseReaction } from '@experiments/framework';
import { whenAlways } from '@experiments/mst-tools';
import debounce from 'lodash/debounce';

import type { TInstance, TParsedMessageWithMeta } from '../@Model';
import type { TDependencies } from '../types';

const DEBOUNCE_TIME = 1000;

const toDisplayText = (message: TParsedMessageWithMeta): string => {
  if (message.type === 'poll') {
    return `Опрос: ${message.question}`;
  }

  if (message.type === 'vote') {
    return 'Голос в опросе';
  }

  return message.text;
};

class NotifyAboutUnreadMessages extends BaseReaction<TInstance, TDependencies> {
  public run() {
    const { coreApi } = this.dependencies;

    const notifyMessages = debounce((unreadMessages: TParsedMessageWithMeta[]) => {
      const withDisplayText = unreadMessages.map((message) => {
        return {
          title: message.author,
          text: toDisplayText(message),
        };
      });

      if (withDisplayText.length > 1) {
        coreApi.notifyAboutManyNewMessages(withDisplayText);
      } else {
        withDisplayText.forEach((message) => {
          coreApi.notifyAboutOneNewMessage(message);
        });
      }
    }, DEBOUNCE_TIME);

    const disposeNotify = whenAlways(
      () => {
        return this.instance.isUnreadMessages;
      },
      () => {
        notifyMessages(this.instance.unreadMessages);
      },
    );

    const disposeNotAvailable = whenAlways(
      () => {
        return !coreApi.hasAvailable();
      },
      () => {
        notifyMessages.cancel();
      },
    );

    return () => {
      notifyMessages.cancel();
      disposeNotify();
      disposeNotAvailable();
    };
  }
}

export default NotifyAboutUnreadMessages;
