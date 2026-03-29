import { EnableChat } from './components';

export type TProps = {
  hasEnableChatInProgress: () => boolean;
  onEnableChat: () => void;
};

const ViewEnableChat: React.FC<TProps> = ({ hasEnableChatInProgress, onEnableChat }) => {
  return <EnableChat hasLoading={hasEnableChatInProgress} onEnableChat={onEnableChat} />;
};

export default ViewEnableChat;
