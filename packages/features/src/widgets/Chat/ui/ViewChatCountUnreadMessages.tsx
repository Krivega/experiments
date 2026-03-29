import type { TFeatures } from './types';

type TProps = {
  features: TFeatures;
};

const ViewChatCountUnreadMessages: React.FC<TProps> = ({
  features: { ChatCountUnreadMessages },
}) => {
  return <ChatCountUnreadMessages />;
};

export default ViewChatCountUnreadMessages;
