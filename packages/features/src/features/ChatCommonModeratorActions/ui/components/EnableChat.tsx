import { Button, LoaderCircle } from '@experiments/components';
import { observer } from 'mobx-react';

import { formatMessage, messagesDescriptors } from '@/shared/translations';
import testIds from './testIds';

type TProps = {
  hasLoading: () => boolean;
  onEnableChat: () => void;
};

const EnableChat: React.FC<TProps> = ({ hasLoading, onEnableChat }) => {
  const isLoading = hasLoading();

  return (
    <Button
      disabled={isLoading}
      loader={<LoaderCircle active={isLoading} size="small" testid={testIds.enableChatLoader} />}
      testid={testIds.enableChat}
      onClick={onEnableChat}
    >
      {formatMessage(messagesDescriptors.enable)}
    </Button>
  );
};

export default observer(EnableChat);
