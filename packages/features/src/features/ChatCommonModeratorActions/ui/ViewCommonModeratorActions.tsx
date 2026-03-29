import { List } from '@experiments/components';

import { ClearChat, DisableChat, Menu } from './components';

export type TProps = {
  hasDisableChatInProgress: () => boolean;
  hasClearChatInProgress: () => boolean;
  onDisableChat: () => void;
  onClearChat: () => void;
};

const ViewCommonModeratorActions: React.FC<TProps> = ({
  hasDisableChatInProgress,
  hasClearChatInProgress,
  onDisableChat,
  onClearChat,
}) => {
  return (
    <Menu>
      <List>
        <DisableChat hasLoading={hasDisableChatInProgress} onDisableChat={onDisableChat} />

        <ClearChat hasLoading={hasClearChatInProgress} onClearChat={onClearChat} />
      </List>
    </Menu>
  );
};

export default ViewCommonModeratorActions;
