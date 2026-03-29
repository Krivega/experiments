import { Icon, ListItem } from '@experiments/components';
import { observer } from 'mobx-react';

import { formatMessage, messagesDescriptors } from '@/shared/translations';
import { ListItemLoader } from '@/shared/ui';
import testIds from './testIds';

type TProps = {
  hasLoading: () => boolean;
  onClearChat: () => void;
};

const ClearChat = ({ hasLoading, onClearChat }: TProps) => {
  const isLoading = hasLoading();

  let graphic = <Icon color="gray" icon="delete_forever" />;

  if (isLoading) {
    graphic = <ListItemLoader testId={testIds.clearChatLoader} />;
  }

  return (
    <ListItem
      disabled={isLoading}
      graphic={graphic}
      testid={testIds.clearChat}
      variant="popup"
      onClick={onClearChat}
    >
      {formatMessage(messagesDescriptors.clearChat)}
    </ListItem>
  );
};

export default observer(ClearChat);
