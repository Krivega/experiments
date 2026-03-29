import { Icon, LayoutContent, Text } from '@experiments/components';
import { observer } from 'mobx-react';

import { formatMessage, messagesDescriptors } from '@/shared/translations';
import { BottomIndent } from '@/shared/ui';
import testIds from './testIds';

type TProps = {
  EnableChatAction: React.ComponentType;
  hasModerator: () => boolean;
};

const ChatNotAvailable: React.FC<TProps> = ({ EnableChatAction, hasModerator }) => {
  return (
    <LayoutContent centered column>
      <BottomIndent>
        <Icon icon="speaker_notes_off" size="medium" />
      </BottomIndent>

      <Text centered color="hint" testid={testIds.chatIsBlockByAdmin} width={120}>
        {formatMessage(messagesDescriptors.disableChatModerator)}
      </Text>

      {hasModerator() ? <EnableChatAction /> : undefined}
    </LayoutContent>
  );
};

export default observer(ChatNotAvailable);
