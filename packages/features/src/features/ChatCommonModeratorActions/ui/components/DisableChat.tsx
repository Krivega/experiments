import { Icon, ListItem } from '@experiments/components';
import { observer } from 'mobx-react';

import { formatMessage, messagesDescriptors } from '@/shared/translations';
import { ListItemLoader } from '@/shared/ui';
import testIds from './testIds';

type TProps = {
  hasLoading: () => boolean;
  onDisableChat: () => void;
};

const DisableChat = ({ hasLoading, onDisableChat }: TProps) => {
  const isLoading = hasLoading();

  let graphic = <Icon color="gray" icon="speaker_notes_off" />;

  if (isLoading) {
    graphic = <ListItemLoader testId={testIds.disableChatLoader} />;
  }

  return (
    <ListItem
      disabled={isLoading}
      graphic={graphic}
      testid={testIds.disableChat}
      variant="popup"
      onClick={onDisableChat}
    >
      {formatMessage(messagesDescriptors.disableChat)}
    </ListItem>
  );
};

export default observer(DisableChat);
